import { ILoggerService, LogOptions } from "../Domain/services/ILoggerService";
import { LogType } from "../Domain/enums/LogType";
import { IAuditClient } from "../Domain/services/IAuditClient";


export class LoggerService implements ILoggerService {
  private readonly microserviceName: string;

  constructor(
    private readonly auditClient: IAuditClient,
    microserviceName = "prodaja"
  ) {
    this.microserviceName = microserviceName;
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(message: string, type: LogType, options?: LogOptions): Promise<void> {
    try {
      await this.auditClient.sendLog({
        tip_zapisa: type,
        opis: message,
        mikroservis: this.microserviceName,
        korisnik_id: options?.userId,
        ip_adresa: options?.ipAddress,
        dodatni_podaci: options?.additionalData,
      });
    } catch (error) {
      console.error("Failed to send log to audit service:", error);
      console.log(`[${type}] ${message}`, options);
    }
  }
}
