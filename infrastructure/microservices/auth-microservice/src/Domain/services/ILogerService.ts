export interface LogContext {
  korisnikId?: number;
  ipAdresa?: string;
  dodatniPodaci?: object;
}

export interface ILogerService {
  log(message: string, type?: string, context?: LogContext): Promise<boolean>;
}