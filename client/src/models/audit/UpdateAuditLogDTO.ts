import { AuditLogLevel } from "./AuditLogDTO";

export interface UpdateAuditLogDTO {
  tip_zapisa?: AuditLogLevel;
  opis?: string;
  mikroservis?: string | null;
  korisnik_id?: number | null;
  ip_adresa?: string | null;
  dodatni_podaci?: Record<string, unknown> | null;
}
