export interface AuditLogDTO {
  id: number;
  tip_zapisa: string;
  datum_vreme: Date;
  opis: string;
  mikroservis: string | null;
  korisnik_id: number | null;
  ip_adresa: string | null;
  dodatni_podaci: object | null;
}