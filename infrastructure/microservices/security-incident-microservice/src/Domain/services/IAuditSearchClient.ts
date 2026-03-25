import { AuditLogDTO } from "../DTOs/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../DTOs/AuditLogSearchCriteriaDTO";

export interface IAuditSearchClient {
  searchLogs(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLogDTO[]>;
}
