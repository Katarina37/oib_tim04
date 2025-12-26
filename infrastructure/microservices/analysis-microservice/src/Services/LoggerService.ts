import { ILoggerService, LogOptions } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IAuditClient } from "../Domain/services/IAuditClient";

export class LoggerService implements ILoggerService {
  private readonly microserviceName: string;

  constructor(
    private readonly auditClient: IAuditClient,
    microserviceName = "proizvodnja"
  ) {
    this.microserviceName = microserviceName;
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(message: string, level: LogLevel, options?: LogOptions): Promise<void> {
    try {
      await this.auditClient.sendLog({
        tipZapisa: level,
        opis: message,
        mikroservis: this.microserviceName,
        korisnikId: options?.userId,
        ipAdresa: options?.ipAddress,
        dodatniPodaci: options?.additionalData,
      });
    } catch (error) {
      console.error("Failed to send log to audit service:", error);
      console.log(`[${level}] ${message}`, options);
    }
  }
}
