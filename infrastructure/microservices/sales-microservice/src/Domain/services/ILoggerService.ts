import { LogType } from "../enums/LogType";

export interface LogOptions {
  userId?: number;
  ipAddress?: string;
  additionalData?: Record<string, unknown>;
}

export interface ILoggerService {
  log(message: string, type: LogType, options?: LogOptions): Promise<void>;
}