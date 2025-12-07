import axios from "axios";
import { ILogerService, LogContext } from "../Domain/services/ILogerService";

export enum LogType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export class LogerService implements ILogerService {
  private readonly auditServiceUrl: string;
  private readonly microserviceName: string = "auth-microservice";

  constructor() {
    this.auditServiceUrl = process.env.AUDIT_SERVICE_URL || "";
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(
    message: string,
    type: LogType = LogType.INFO,
    context?: LogContext
  ): Promise<boolean> {
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m [${type}] ${message}`);

    if (this.auditServiceUrl) {
      try {
        await axios.post(`${this.auditServiceUrl}/api/v1/logs`, {
          tip_zapisa: type,
          opis: message,
          mikroservis: this.microserviceName,
          korisnik_id: context?.korisnikId ?? null,
          ip_adresa: context?.ipAdresa ?? null,
          dodatni_podaci: context?.dodatniPodaci ?? null,
        });
      } catch {
        console.error(
          `\x1b[31m[Logger@1.45.4]\x1b[0m Failed to send log to audit service`
        );
      }
    }
    return true;
  }
}