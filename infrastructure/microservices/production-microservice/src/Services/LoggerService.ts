import axios from "axios";
import { ILoggerService, LogOptions } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";

export class LoggerService implements ILoggerService {
  private readonly auditServiceUrl: string;
  private readonly microserviceName: string = "proizvodnja";

  constructor() {
    this.auditServiceUrl = process.env.AUDIT_SERVICE_URL || "http://localhost:3002";
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(message: string, level: LogLevel, options?: LogOptions): Promise<void> {
    try {
      await axios.post(`${this.auditServiceUrl}/audit-logs`, {
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