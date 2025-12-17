import { LogLevel } from "../Domain/enums/LogLevel";
import { ILoggerService, LogContext } from "../Domain/services/ILoggerService";

export class LoggerService implements ILoggerService {
  private readonly microserviceName: string;

  constructor(microserviceName = "audit-microservice") {
    this.microserviceName = microserviceName;
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(message: string, level: LogLevel, context?: LogContext): Promise<void> {
    const logEntry = {
      microservice: this.microserviceName,
      level,
      message,
      ipAddress: context?.ipAddress,
      additionalData: context?.additionalData,
    };

    if (level === LogLevel.ERROR) {
      console.error(logEntry);
      return;
    }

    console.log(logEntry);
  }
}
