import { ILogerService, LogContext } from "../Domain/services/ILogerService";
import { IAuditClient } from "../Domain/services/IAuditClient";

export enum LogType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export class LogerService implements ILogerService {
  private readonly microserviceName: string = "auth-microservice";

  constructor(private readonly auditClient: IAuditClient) {
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(
    message: string,
    type: LogType = LogType.INFO,
    context?: LogContext
  ): Promise<boolean> {
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m [${type}] ${message}`);

    try {
      await this.auditClient.sendLog({
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
    return true;
  }
}
