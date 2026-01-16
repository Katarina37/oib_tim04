import { ILoggerService, LogOptions } from "../Domain/services/ILoggerService";
import { IAuditClient } from "../Domain/services/IAuditClient";
import { LogLevel } from "../Domain/enums/LogLevel";

const MICROSERVICE_NAME = "vremenski_uslovi";

export class LoggerService implements ILoggerService {
  constructor(private readonly auditClient: IAuditClient) {}

  async log(message: string, level: LogLevel, options?: LogOptions): Promise<void> {
    try {
      await this.auditClient.sendLog({
        tipZapisa: level,
        opis: message,
        mikroservis: MICROSERVICE_NAME,
        korisnikId: options?.userId ?? null,
        ipAdresa: options?.ipAddress ?? null,
        dodatniPodaci: options?.additionalData ?? null,
      });
    } catch (error) {
      console.error(`[LoggerService] Failed to send audit log: ${(error as Error).message}`);
    }
  }
}
