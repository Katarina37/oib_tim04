import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { AuthResponse } from "../types/AuthResponse";

export interface IAuthClient {
  login(data: LoginUserDTO): Promise<AuthResponse>;
  register(data: RegistrationUserDTO): Promise<AuthResponse>;
}