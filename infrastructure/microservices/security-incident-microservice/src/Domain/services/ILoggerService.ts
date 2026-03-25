import { LogLevel } from "../enums/LogLevel";

export interface LogOptions {
  userId?: number | null;
  ipAddress?: string | null;
  additionalData?: Record<string, unknown> | null;
}

export interface ILoggerService {
  log(message: string, level: LogLevel, options?: LogOptions): Promise<void>;
}
