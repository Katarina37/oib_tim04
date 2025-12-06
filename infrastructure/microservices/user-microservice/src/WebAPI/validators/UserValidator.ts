import { CreateUserDTO } from "../../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../../Domain/DTOs/UpdateUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateCreateUserData(data: CreateUserDTO): ValidationResult {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters" };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  if (!data.email || !isValidEmail(data.email)) {
    return { success: false, message: "Invalid email format" };
  }

  if (!data.role || !Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }

  return { success: true };
}

export function validateUpdateUserData(data: UpdateUserDTO): ValidationResult {
  if (data.username !== undefined && data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters" };
  }

  if (data.password !== undefined && data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    return { success: false, message: "Invalid email format" };
  }

  if (data.role !== undefined && !Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }

  return { success: true };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}