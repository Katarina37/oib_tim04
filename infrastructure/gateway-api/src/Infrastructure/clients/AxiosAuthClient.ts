import { AxiosInstance } from "axios";
import { IAuthClient } from "../../Domain/clients/IAuthClient";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";

export class AxiosAuthClient implements IAuthClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const response = await this.httpClient.post<AuthResponseType>("/auth/login", data);
    return response.data;
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    const response = await this.httpClient.post<AuthResponseType>("/auth/register", data);
    return response.data;
  }
}
