import { AuditLogDTO } from "../Domain/DTOs/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../Domain/DTOs/AuditLogSearchCriteriaDTO";
import { CreateAuditLogDTO } from "../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../Domain/DTOs/UpdateAuditLogDTO";
import { NotFoundError } from "../Domain/errors/NotFoundError";
import { ValidationError } from "../Domain/errors/ValidationError";
import { LogLevel } from "../Domain/enums/LogLevel";
import { AuditLog } from "../Domain/models/AuditLog";
import { IAuditLogRepository } from "../Domain/repositories/IAuditLogRepository";
import { IAuditService } from "../Domain/services/IAuditService";
import { ILoggerService } from "../Domain/services/ILoggerService";

export class AuditService implements IAuditService {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly logger?: ILoggerService
  ) {}

  async getAllLogs(): Promise<AuditLogDTO[]> {
    const logs = await this.auditLogRepository.findAll();
    return logs.map((log) => this.toDTO(log));
  }

  async getLogById(id: number): Promise<AuditLogDTO> {
    this.ensureValidId(id);

    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError(`Audit log with ID ${id} not found.`);
    }

    return this.toDTO(log);
  }

  async createLog(data: CreateAuditLogDTO): Promise<AuditLogDTO> {
    const newLog = this.auditLogRepository.create({
      tip_zapisa: data.tip_zapisa,
      opis: data.opis.trim(),
      mikroservis: data.mikroservis ?? null,
      korisnik_id: data.korisnik_id ?? null,
      ip_adresa: data.ip_adresa ?? null,
      dodatni_podaci: data.dodatni_podaci ?? null,
    });

    const savedLog = await this.auditLogRepository.save(newLog);
    await this.safeWriteServiceLog(
      `Audit log created (id=${savedLog.id}, level=${savedLog.tipZapisa}).`,
      LogLevel.INFO
    );

    return this.toDTO(savedLog);
  }

  async updateLog(id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO> {
    this.ensureValidId(id);

    const existingLog = await this.auditLogRepository.findById(id);
    if (!existingLog) {
      throw new NotFoundError(`Audit log with ID ${id} not found.`);
    }

    if (data.tip_zapisa !== undefined) {
      existingLog.tipZapisa = data.tip_zapisa;
    }

    if (data.opis !== undefined) {
      existingLog.opis = data.opis.trim();
    }

    if (data.mikroservis !== undefined) {
      existingLog.mikroservis = data.mikroservis ?? null;
    }

    if (data.korisnik_id !== undefined) {
      existingLog.korisnikId = data.korisnik_id ?? null;
    }

    if (data.ip_adresa !== undefined) {
      existingLog.ipAdresa = data.ip_adresa ?? null;
    }

    if (data.dodatni_podaci !== undefined) {
      existingLog.dodatniPodaci = data.dodatni_podaci ?? null;
    }

    const updatedLog = await this.auditLogRepository.save(existingLog);
    await this.safeWriteServiceLog(`Audit log updated (id=${updatedLog.id}).`, LogLevel.INFO);

    return this.toDTO(updatedLog);
  }

  async deleteLog(id: number): Promise<void> {
    this.ensureValidId(id);

    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError(`Audit log with ID ${id} not found.`);
    }

    await this.auditLogRepository.remove(log);
    await this.safeWriteServiceLog(`Audit log deleted (id=${id}).`, LogLevel.WARNING);
  }

  async searchLogs(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLogDTO[]> {
    const logs = await this.auditLogRepository.search(criteria);
    return logs.map((log) => this.toDTO(log));
  }

  private toDTO(log: AuditLog): AuditLogDTO {
    return {
      id: log.id,
      tip_zapisa: log.tipZapisa,
      datum_vreme: log.datumVreme,
      opis: log.opis,
      mikroservis: log.mikroservis,
      korisnik_id: log.korisnikId,
      ip_adresa: log.ipAdresa,
      dodatni_podaci: log.dodatniPodaci,
    };
  }

  private ensureValidId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Audit log ID must be a positive integer.");
    }
  }

  private async safeWriteServiceLog(message: string, level: LogLevel): Promise<void> {
    if (!this.logger) {
      return;
    }

    try {
      await this.logger.log(message, level, {
        additionalData: { source: "audit-service" },
      });
    } catch {
      // Service logging must not break the business flow.
    }
  }
}
