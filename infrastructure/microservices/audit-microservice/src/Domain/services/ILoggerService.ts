import { LogLevel } from "../enums/LogLevel";

export interface LogContext {
  ipAddress?: string;
  additionalData?: Record<string, unknown>;
}

export interface ILoggerService {
  log(message: string, level: LogLevel, context?: LogContext): Promise<void>;
}
