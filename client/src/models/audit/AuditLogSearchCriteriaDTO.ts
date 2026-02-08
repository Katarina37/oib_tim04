import { AuditLogLevel } from "./AuditLogDTO";

export interface AuditLogSearchCriteriaDTO {
  tip_zapisa?: AuditLogLevel;
  opis?: string;
  mikroservis?: string;
  korisnik_id?: number;
  ip_adresa?: string;
  datum_od?: Date | string;
  datum_do?: Date | string;
}
