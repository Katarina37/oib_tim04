import { LogLevel } from "../enums/LogLevel";

export interface CreateAuditLogDTO {
  tip_zapisa: LogLevel;
  opis: string;
  mikroservis?: string;
  korisnik_id?: number;
  ip_adresa?: string;
  dodatni_podaci?: object;
}