import { LogLevel } from "../enums/LogLevel";

export interface AuditLogSearchCriteriaDTO {
  tip_zapisa?: LogLevel;
  mikroservis?: string;
  korisnik_id?: number;
  datum_od?: Date;
  datum_do?: Date;
}