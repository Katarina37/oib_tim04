import { IAuditService } from "../Domain/services/IAuditService";
import { AuditLog } from "../Domain/models/AuditLog";
import { AuditLogDTO } from "../Domain/DTOs/AuditLogDTO";
import { CreateAuditLogDTO } from "../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../Domain/DTOs/UpdateAuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../Domain/DTOs/AuditLogSearchCriteriaDTO";
import { IAuditLogRepository } from "../Domain/repositories/IAuditLogRepository";

export class AuditService implements IAuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async getAllLogs(): Promise<AuditLogDTO[]> {
    const logs = await this.auditLogRepository.findAll();
    return logs.map((log) => this.toDTO(log));
  }

  async getLogById(id: number): Promise<AuditLogDTO> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new Error(`Audit log with ID ${id} not found`);
    }
    return this.toDTO(log);
  }

  async createLog(data: CreateAuditLogDTO): Promise<AuditLogDTO> {
    const newLog = this.auditLogRepository.create({
      tip_zapisa: data.tip_zapisa,
      opis: data.opis,
      mikroservis: data.mikroservis ?? null,
      korisnik_id: data.korisnik_id ?? null,
      ip_adresa: data.ip_adresa ?? null,
      dodatni_podaci: data.dodatni_podaci ?? null,
    });

    const savedLog = await this.auditLogRepository.save(newLog);
    this.logToConsole(savedLog);
    return this.toDTO(savedLog);
  }

  async updateLog(id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new Error(`Audit log with ID ${id} not found`);
    }

    if (data.tip_zapisa !== undefined) {
      log.tipZapisa = data.tip_zapisa;
    }
    if (data.opis !== undefined) {
      log.opis = data.opis;
    }
    if (data.mikroservis !== undefined) {
      log.mikroservis = data.mikroservis ?? null;
    }
    if (data.korisnik_id !== undefined) {
      log.korisnikId = data.korisnik_id ?? null;
    }
    if (data.ip_adresa !== undefined) {
      log.ipAdresa = data.ip_adresa ?? null;
    }
    if (data.dodatni_podaci !== undefined) {
      log.dodatniPodaci = data.dodatni_podaci ?? null;
    }

    const updatedLog = await this.auditLogRepository.save(log);
    return this.toDTO(updatedLog);
  }

  async deleteLog(id: number): Promise<void> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new Error(`Audit log with ID ${id} not found`);
    }
    await this.auditLogRepository.remove(log);
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

  private logToConsole(log: AuditLog): void {
    const timestamp = new Date().toISOString();
    const level = log.tipZapisa;
    const message = `[${timestamp}] [${level}] ${log.opis}`;

    switch (level) {
      case "ERROR":
        console.error(message);
        break;
      case "WARNING":
        console.warn(message);
        break;
      case "INFO":
        console.info(message);
        break;
      default:
        console.log(message);
    }
  }
}
