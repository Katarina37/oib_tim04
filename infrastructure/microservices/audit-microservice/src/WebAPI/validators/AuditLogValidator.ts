import { CreateAuditLogDTO } from "../../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../../Domain/DTOs/UpdateAuditLogDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateCreateAuditLogData(data: CreateAuditLogDTO): ValidationResult {
  if (!data.tip_zapisa || !Object.values(LogLevel).includes(data.tip_zapisa)) {
    return { success: false, message: "Invalid log level. Must be INFO, WARNING, or ERROR" };
  }

  if (!data.opis || data.opis.trim().length === 0) {
    return { success: false, message: "Description (opis) is required" };
  }

  if (data.mikroservis && data.mikroservis.length > 100) {
    return { success: false, message: "Microservice name cannot exceed 100 characters" };
  }

  if (data.ip_adresa && data.ip_adresa.length > 45) {
    return { success: false, message: "IP address cannot exceed 45 characters" };
  }

  return { success: true };
}

export function validateUpdateAuditLogData(data: UpdateAuditLogDTO): ValidationResult {
  if (data.tip_zapisa !== undefined && !Object.values(LogLevel).includes(data.tip_zapisa)) {
    return { success: false, message: "Invalid log level. Must be INFO, WARNING, or ERROR" };
  }

  if (data.opis !== undefined && data.opis.trim().length === 0) {
    return { success: false, message: "Description (opis) cannot be empty" };
  }

  if (data.mikroservis !== undefined && data.mikroservis.length > 100) {
    return { success: false, message: "Microservice name cannot exceed 100 characters" };
  }

  if (data.ip_adresa !== undefined && data.ip_adresa.length > 45) {
    return { success: false, message: "IP address cannot exceed 45 characters" };
  }

  return { success: true };
}