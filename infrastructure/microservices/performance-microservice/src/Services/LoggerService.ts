import { ILoggerService, LogOptions } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IAuditClient } from "../Domain/services/IAuditClient";

export class LoggerService implements ILoggerService {
  private readonly microserviceName: string;

  constructor(
    private readonly auditClient: IAuditClient,
    microserviceName = "performance-microservice"
  ) {
    this.microserviceName = microserviceName;
    console.log(
      "\x1b[35m[Logger@1.0.0]\x1b[0m Performance microservice logger initialized"
    );
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
      console.error(
        "\x1b[31m[Logger@1.0.0]\x1b[0m Failed to send log to audit service:",
        (error as Error).message
      );
      console.log(`[${level}] ${message}`, options);
    }
  }
}
