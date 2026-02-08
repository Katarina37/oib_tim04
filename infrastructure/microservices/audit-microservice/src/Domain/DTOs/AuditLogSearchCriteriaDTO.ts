import { LogLevel } from "../enums/LogLevel";

export interface AuditLogSearchCriteriaDTO {
  tip_zapisa?: LogLevel;
  opis?: string;
  mikroservis?: string;
  korisnik_id?: number;
  ip_adresa?: string;
  datum_od?: Date;
  datum_do?: Date;
}
