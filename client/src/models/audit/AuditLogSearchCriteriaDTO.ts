import { AuditLogLevel } from "./AuditLogDTO";

export interface AuditLogSearchCriteriaDTO {
  tip_zapisa?: AuditLogLevel;
  mikroservis?: string;
  korisnik_id?: number;
  datum_od?: Date | string;
  datum_do?: Date | string;
}
