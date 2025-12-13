import { AuthTokenClaims } from "./AuthTokenClaims";

export interface AuthResponse {
  success: boolean;
  token?: string;
  userData?: AuthTokenClaims;
  message?: string;
}
