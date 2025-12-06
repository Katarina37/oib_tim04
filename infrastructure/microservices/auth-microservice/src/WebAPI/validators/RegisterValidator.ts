import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateRegistrationData(data: RegistrationUserDTO): ValidationResult {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }

  if (data.username.trim().length > 100) {
    return { success: false, message: "Username cannot exceed 100 characters" };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }

  if (!data.email || !isValidEmail(data.email)) {
    return { success: false, message: "Invalid email address" };
  }

  if (!Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role. Must be ADMIN, SALES_MANAGER, or SELLER" };
  }

  if (data.firstName && data.firstName.length > 100) {
    return { success: false, message: "First name cannot exceed 100 characters" };
  }

  if (data.lastName && data.lastName.length > 100) {
    return { success: false, message: "Last name cannot exceed 100 characters" };
  }

  if (data.profileImage && !isValidBase64(data.profileImage)) {
    return { success: false, message: "Profile image must be in valid base64 format" };
  }

  return { success: true };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) return true;
  const base64Regex = /^(data:image\/[a-zA-Z]+;base64,)?[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(str);
}