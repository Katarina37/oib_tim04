import { AuditLogSearchCriteriaDTO } from "../DTOs/AuditLogSearchCriteriaDTO";
import { LogLevel } from "../enums/LogLevel";
import { AuditLog } from "../models/AuditLog";

export interface CreateAuditLogData {
  tip_zapisa: LogLevel;
  opis: string;
  mikroservis?: string | null;
  korisnik_id?: number | null;
  ip_adresa?: string | null;
  dodatni_podaci?: object | null;
}

export interface IAuditLogRepository {
  findAll(): Promise<AuditLog[]>;
  findById(id: number): Promise<AuditLog | null>;
  create(data: CreateAuditLogData): AuditLog;
  save(log: AuditLog): Promise<AuditLog>;
  remove(log: AuditLog): Promise<void>;
  search(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLog[]>;
}
