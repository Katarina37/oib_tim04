import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateLoginData(data: LoginUserDTO): ValidationResult {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }

  return { success: true };
}