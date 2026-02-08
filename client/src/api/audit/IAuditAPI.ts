import { AuditLogDTO } from "../../models/audit/AuditLogDTO";
import { CreateAuditLogDTO } from "../../models/audit/CreateAuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../models/audit/AuditLogSearchCriteriaDTO";
import { UpdateAuditLogDTO } from "../../models/audit/UpdateAuditLogDTO";

export interface IAuditAPI {
  getAllLogs(token: string): Promise<AuditLogDTO[]>;
  getLogById(id: number, token: string): Promise<AuditLogDTO>;
  createLog(data: CreateAuditLogDTO, token: string): Promise<AuditLogDTO>;
  updateLog(id: number, data: UpdateAuditLogDTO, token: string): Promise<AuditLogDTO>;
  deleteLog(id: number, token: string): Promise<void>;
  searchLogs(criteria: AuditLogSearchCriteriaDTO, token: string): Promise<AuditLogDTO[]>;
}
