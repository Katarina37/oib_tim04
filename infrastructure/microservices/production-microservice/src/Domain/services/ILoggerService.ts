import { LogLevel } from "../enums/LogLevel";

export interface LogOptions {
  userId?: number;
  ipAddress?: string;
  additionalData?: Record<string, unknown>;
}

export interface ILoggerService {
  log(message: string, level: LogLevel, options?: LogOptions): Promise<void>;
}