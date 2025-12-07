import { CreateAuditLogDTO } from "../DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../DTOs/UpdateAuditLogDTO";
import { AuditLogDTO } from "../DTOs/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../DTOs/AuditLogSearchCriteriaDTO";

export interface IAuditService {
  getAllLogs(): Promise<AuditLogDTO[]>;
  getLogById(id: number): Promise<AuditLogDTO>;
  createLog(data: CreateAuditLogDTO): Promise<AuditLogDTO>;
  updateLog(id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO>;
  deleteLog(id: number): Promise<void>;
  searchLogs(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLogDTO[]>;
}