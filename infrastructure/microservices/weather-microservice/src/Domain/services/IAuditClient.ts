export interface AuditLogPayload {
  tipZapisa: string;
  opis: string;
  mikroservis: string;
  korisnikId?: number | null;
  ipAdresa?: string | null;
  dodatniPodaci?: Record<string, unknown> | null;
}

export interface IAuditClient {
  sendLog(payload: AuditLogPayload): Promise<void>;
}
