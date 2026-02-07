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

  if (data.profileImage && !isValidBase64Image(data.profileImage)) {
    return { success: false, message: "Profile image must be a valid base64 string" };
  }

  return { success: true };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidBase64Image(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const dataUriMatch = trimmed.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  const payload = dataUriMatch ? dataUriMatch[1] : trimmed;

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
    return false;
  }

  return payload.length % 4 === 0;
}
