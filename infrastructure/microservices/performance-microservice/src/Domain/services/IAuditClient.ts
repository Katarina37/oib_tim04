export interface AuditLogPayload {
    tip_zapisa: string;
    opis: string;
    mikroservis: string;
    korisnik_id?: number | null;
    ip_adresa?: string | null;
    dodatni_podaci?: object | Record<string, unknown> | null;
}

export interface IAuditClient {
  sendLog(payload: AuditLogPayload): Promise<void>;
}