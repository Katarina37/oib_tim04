import { AuditLogDTO } from "../../models/audit/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../models/audit/AuditLogSearchCriteriaDTO";

export interface IAuditAPI {
  searchLogs(criteria: AuditLogSearchCriteriaDTO, token: string): Promise<AuditLogDTO[]>;
}
