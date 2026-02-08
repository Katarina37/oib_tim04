import { LogLevel } from "../enums/LogLevel";

export interface AuditLogPayload {
  tipZapisa: LogLevel;
  opis: string;
  mikroservis: string;
  korisnikId?: number;
  ipAdresa?: string;
  dodatniPodaci?: Record<string, unknown>;
}

export interface IAuditClient {
  sendLog(payload: AuditLogPayload): Promise<void>;
}
