import { AxiosInstance } from "axios";
import { IAuthClient } from "../../Domain/clients/IAuthClient";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { AuthResponse } from "../../Domain/types/AuthResponse";

export class AxiosAuthClient implements IAuthClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    const response = await this.httpClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponse> {
    const response = await this.httpClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  }
}
