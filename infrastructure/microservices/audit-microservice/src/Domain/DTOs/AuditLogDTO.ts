import { LogLevel } from "../enums/LogLevel";

export interface AuditLogDTO {
  id: number;
  tip_zapisa: LogLevel;
  datum_vreme: Date;
  opis: string;
  mikroservis: string | null;
  korisnik_id: number | null;
  ip_adresa: string | null;
  dodatni_podaci: Record<string, unknown> | null;
}
