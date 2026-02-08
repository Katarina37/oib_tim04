import { LogLevel } from "../enums/LogLevel";

export interface CreateAuditLogDTO {
  tip_zapisa: LogLevel;
  opis: string;
  mikroservis?: string | null;
  korisnik_id?: number | null;
  ip_adresa?: string | null;
  dodatni_podaci?: Record<string, unknown> | null;
}
