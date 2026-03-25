import { AuditLogDTO } from "../Domain/DTOs/AuditLogDTO";
import { SecurityIncidentDTO } from "../Domain/DTOs/SecurityIncidentDTO";
import { IncidentSeverity } from "../Domain/enums/IncidentSeverity";
import { IncidentStatus } from "../Domain/enums/IncidentStatus";
import { IncidentType } from "../Domain/enums/IncidentType";
import { LogLevel } from "../Domain/enums/LogLevel";
import { SecurityIncident } from "../Domain/models/SecurityIncident";
import { IAuditSearchClient } from "../Domain/services/IAuditSearchClient";
import { IIncidentRepository } from "../Domain/services/IIncidentRepository";
import { IIncidentService, ScanResult } from "../Domain/services/IIncidentService";
import { ILoggerService } from "../Domain/services/ILoggerService";

interface IncidentServiceConfig {
  defaultLookbackMinutes: number;
  bruteForceThreshold: number;
  unauthorizedThreshold: number;
  errorSpikeThreshold: number;
}

interface RuleHit {
  incidentType: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  fingerprint: string;
  sourceMicroservice: string | null;
  matchedLogs: AuditLogDTO[];
  evidence: Record<string, unknown>;
}

const MICROserviceName = "security_incident";

export class IncidentService implements IIncidentService {
  constructor(
    private readonly incidentRepository: IIncidentRepository,
    private readonly logger: ILoggerService,
    private readonly auditSearchClient: IAuditSearchClient,
    private readonly config: IncidentServiceConfig
  ) {}

  async getAll(): Promise<SecurityIncidentDTO[]> {
    const incidents = await this.incidentRepository.findAll();
    return incidents.map((incident) => this.toDTO(incident));
  }

  async getByStatus(status: IncidentStatus): Promise<SecurityIncidentDTO[]> {
    const incidents = await this.incidentRepository.findByStatus(status);
    return incidents.map((incident) => this.toDTO(incident));
  }

  async getById(id: number): Promise<SecurityIncidentDTO> {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new Error(`Security incident not found (id=${id}).`);
    }

    return this.toDTO(incident);
  }

  async updateStatus(id: number, status: IncidentStatus): Promise<SecurityIncidentDTO> {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new Error(`Security incident not found (id=${id}).`);
    }

    incident.status = status;
    incident.resolvedAt =
      status === IncidentStatus.RESOLVED || status === IncidentStatus.FALSE_POSITIVE
        ? new Date()
        : null;

    const saved = await this.incidentRepository.save(incident);

    await this.logger.log(
      `Security incident ${id} status changed to ${status}.`,
      LogLevel.INFO,
      {
        additionalData: {
          incidentId: id,
          newStatus: status,
        },
      }
    );

    return this.toDTO(saved);
  }

  async runScan(lookbackMinutes?: number): Promise<ScanResult> {
    const effectiveLookback = this.getEffectiveLookback(lookbackMinutes);
    const logs = await this.fetchAuditLogs(effectiveLookback);

    const hits: RuleHit[] = [
      ...this.detectBruteForce(logs),
      ...this.detectUnauthorizedAccess(logs),
      ...this.detectErrorSpike(logs),
    ];

    let created = 0;
    let updated = 0;

    for (const hit of hits) {
      const wasCreated = await this.upsertIncidentFromRule(hit);
      if (wasCreated) {
        created += 1;
      } else {
        updated += 1;
      }
    }

    await this.logger.log(
      `Security scan completed. created=${created}, updated=${updated}, evaluatedLogs=${logs.length}`,
      LogLevel.INFO,
      {
        additionalData: {
          lookbackMinutes: effectiveLookback,
          created,
          updated,
          evaluatedLogs: logs.length,
        },
      }
    );

    return {
      created,
      updated,
      evaluatedLogs: logs.length,
    };
  }

  private getEffectiveLookback(lookbackMinutes?: number): number {
    if (!lookbackMinutes || !Number.isFinite(lookbackMinutes) || lookbackMinutes <= 0) {
      return this.config.defaultLookbackMinutes;
    }

    return Math.floor(lookbackMinutes);
  }

  private async fetchAuditLogs(lookbackMinutes: number): Promise<AuditLogDTO[]> {
    const fromDate = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();

    try {
      return await this.auditSearchClient.searchLogs({
        datum_od: fromDate,
      });
    } catch (error) {
      await this.logger.log(
        `Failed to fetch audit logs for incident scan: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          additionalData: {
            fromDate,
            lookbackMinutes,
          },
        }
      );
      return [];
    }
  }

  private detectBruteForce(logs: AuditLogDTO[]): RuleHit[] {
    const failedLoginLogs = logs.filter((log) => {
      const text = this.normalizeText(log.opis);
      return (
        text.includes("login") &&
        (text.includes("failed") ||
          text.includes("invalid credentials") ||
          text.includes("neuspes") ||
          text.includes("pogresno"))
      );
    });

    const grouped = new Map<string, AuditLogDTO[]>();

    for (const log of failedLoginLogs) {
      const ip = this.normalizeIp(log.ip_adresa);
      const list = grouped.get(ip) ?? [];
      list.push(log);
      grouped.set(ip, list);
    }

    const hits: RuleHit[] = [];

    for (const [ip, ipLogs] of grouped.entries()) {
      if (ipLogs.length < this.config.bruteForceThreshold) {
        continue;
      }

      const severity =
        ipLogs.length >= this.config.bruteForceThreshold * 2
          ? IncidentSeverity.CRITICAL
          : IncidentSeverity.HIGH;

      hits.push({
        incidentType: IncidentType.BRUTE_FORCE_LOGIN,
        severity,
        title: `Brute-force login pattern detected from ${ip}`,
        description: `Detected ${ipLogs.length} failed login attempts in the monitored interval.`,
        fingerprint: `${IncidentType.BRUTE_FORCE_LOGIN}:${ip}`,
        sourceMicroservice: "auth",
        matchedLogs: ipLogs,
        evidence: {
          ip,
          failedAttempts: ipLogs.length,
          logIds: ipLogs.slice(0, 20).map((log) => log.id),
        },
      });
    }

    return hits;
  }

  private detectUnauthorizedAccess(logs: AuditLogDTO[]): RuleHit[] {
    const unauthorizedLogs = logs.filter((log) => {
      const text = this.normalizeText(log.opis);
      return (
        text.includes("unauthorized") ||
        text.includes("forbidden") ||
        text.includes("access denied") ||
        text.includes("neovlasc") ||
        text.includes("zabranjen")
      );
    });

    const grouped = new Map<string, AuditLogDTO[]>();

    for (const log of unauthorizedLogs) {
      const ip = this.normalizeIp(log.ip_adresa);
      const userKey = log.korisnik_id ? String(log.korisnik_id) : "anon";
      const key = `${ip}|${userKey}`;
      const list = grouped.get(key) ?? [];
      list.push(log);
      grouped.set(key, list);
    }

    const hits: RuleHit[] = [];

    for (const [key, keyLogs] of grouped.entries()) {
      if (keyLogs.length < this.config.unauthorizedThreshold) {
        continue;
      }

      const [ip, userKey] = key.split("|");

      hits.push({
        incidentType: IncidentType.UNAUTHORIZED_ACCESS_PATTERN,
        severity: IncidentSeverity.MEDIUM,
        title: `Repeated unauthorized access attempts (${ip})`,
        description: `Detected ${keyLogs.length} unauthorized access attempts for ip=${ip}, user=${userKey}.`,
        fingerprint: `${IncidentType.UNAUTHORIZED_ACCESS_PATTERN}:${key}`,
        sourceMicroservice: keyLogs[0]?.mikroservis ?? null,
        matchedLogs: keyLogs,
        evidence: {
          ip,
          userKey,
          attempts: keyLogs.length,
          logIds: keyLogs.slice(0, 20).map((log) => log.id),
        },
      });
    }

    return hits;
  }

  private detectErrorSpike(logs: AuditLogDTO[]): RuleHit[] {
    const errorLogs = logs.filter((log) => log.tip_zapisa === LogLevel.ERROR);

    const grouped = new Map<string, AuditLogDTO[]>();

    for (const log of errorLogs) {
      const microservice = (log.mikroservis ?? "unknown").trim() || "unknown";
      const list = grouped.get(microservice) ?? [];
      list.push(log);
      grouped.set(microservice, list);
    }

    const hits: RuleHit[] = [];

    for (const [microservice, microserviceLogs] of grouped.entries()) {
      if (microserviceLogs.length < this.config.errorSpikeThreshold) {
        continue;
      }

      const severity =
        microserviceLogs.length >= this.config.errorSpikeThreshold * 2
          ? IncidentSeverity.CRITICAL
          : IncidentSeverity.HIGH;

      hits.push({
        incidentType: IncidentType.ERROR_SPIKE,
        severity,
        title: `Error spike detected in ${microservice}`,
        description: `Detected ${microserviceLogs.length} ERROR logs for ${microservice} in scan window.`,
        fingerprint: `${IncidentType.ERROR_SPIKE}:${microservice}`,
        sourceMicroservice: microservice,
        matchedLogs: microserviceLogs,
        evidence: {
          microservice,
          errorCount: microserviceLogs.length,
          logIds: microserviceLogs.slice(0, 20).map((log) => log.id),
        },
      });
    }

    return hits;
  }

  private async upsertIncidentFromRule(hit: RuleHit): Promise<boolean> {
    const existing = await this.incidentRepository.findOpenByTypeAndFingerprint(
      hit.incidentType,
      hit.fingerprint
    );

    if (existing) {
      existing.lastMatchedAt = new Date();
      existing.occurrenceCount += hit.matchedLogs.length;
      existing.evidence = {
        ...(existing.evidence ?? {}),
        ...(hit.evidence ?? {}),
      };
      existing.severity = this.maxSeverity(existing.severity, hit.severity);
      await this.incidentRepository.save(existing);
      return false;
    }

    const now = new Date();
    const incident = new SecurityIncident();
    incident.incidentType = hit.incidentType;
    incident.severity = hit.severity;
    incident.status = IncidentStatus.OPEN;
    incident.title = hit.title;
    incident.description = hit.description;
    incident.fingerprint = hit.fingerprint;
    incident.sourceMicroservice = hit.sourceMicroservice;
    incident.detectedAt = now;
    incident.lastMatchedAt = now;
    incident.resolvedAt = null;
    incident.occurrenceCount = hit.matchedLogs.length;
    incident.evidence = {
      ...hit.evidence,
      firstObservedLogAt: this.extractMinDate(hit.matchedLogs),
      lastObservedLogAt: this.extractMaxDate(hit.matchedLogs),
      generatedBy: MICROserviceName,
    };

    const saved = await this.incidentRepository.save(incident);

    await this.logger.log(
      `New security incident created (id=${saved.id}, type=${saved.incidentType}).`,
      LogLevel.WARNING,
      {
        additionalData: {
          incidentId: saved.id,
          incidentType: saved.incidentType,
          severity: saved.severity,
          fingerprint: saved.fingerprint,
        },
      }
    );

    return true;
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private normalizeIp(ip: string | null): string {
    if (!ip) {
      return "unknown";
    }

    const normalized = ip.trim();
    return normalized.length > 0 ? normalized : "unknown";
  }

  private maxSeverity(
    left: IncidentSeverity,
    right: IncidentSeverity
  ): IncidentSeverity {
    const rank = (severity: IncidentSeverity): number => {
      switch (severity) {
        case IncidentSeverity.LOW:
          return 1;
        case IncidentSeverity.MEDIUM:
          return 2;
        case IncidentSeverity.HIGH:
          return 3;
        case IncidentSeverity.CRITICAL:
          return 4;
        default:
          return 0;
      }
    };

    return rank(left) >= rank(right) ? left : right;
  }

  private extractMinDate(logs: AuditLogDTO[]): string | null {
    if (logs.length === 0) return null;

    const min = logs.reduce((acc, log) => {
      const current = new Date(log.datum_vreme).getTime();
      return current < acc ? current : acc;
    }, Number.POSITIVE_INFINITY);

    return Number.isFinite(min) ? new Date(min).toISOString() : null;
  }

  private extractMaxDate(logs: AuditLogDTO[]): string | null {
    if (logs.length === 0) return null;

    const max = logs.reduce((acc, log) => {
      const current = new Date(log.datum_vreme).getTime();
      return current > acc ? current : acc;
    }, Number.NEGATIVE_INFINITY);

    return Number.isFinite(max) ? new Date(max).toISOString() : null;
  }

  private toDTO(incident: SecurityIncident): SecurityIncidentDTO {
    return {
      id: incident.id,
      incidentType: incident.incidentType,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      fingerprint: incident.fingerprint,
      sourceMicroservice: incident.sourceMicroservice,
      detectedAt: incident.detectedAt.toISOString(),
      lastMatchedAt: incident.lastMatchedAt.toISOString(),
      resolvedAt: incident.resolvedAt ? incident.resolvedAt.toISOString() : null,
      occurrenceCount: incident.occurrenceCount,
      evidence: incident.evidence,
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString(),
    };
  }
}
