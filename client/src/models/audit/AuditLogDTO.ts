export enum AuditLogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface AuditLogDTO {
  id: number;
  tip_zapisa: AuditLogLevel | string;
  datum_vreme: string;
  opis: string;
  mikroservis: string | null;
  korisnik_id: number | null;
  ip_adresa: string | null;
  dodatni_podaci: Record<string, unknown> | null;
}
