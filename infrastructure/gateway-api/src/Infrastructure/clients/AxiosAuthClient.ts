import axios, { AxiosInstance, AxiosError } from "axios";
import { IAuthClient } from "../../Domain/clients/IAuthClient";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { AuthResponse } from "../../Domain/types/AuthResponse";

export class AxiosAuthClient implements IAuthClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  private buildErrorResponse(
    error: AxiosError<AuthResponse>,
    fallbackMessage: string
  ): AuthResponse {
    const responseBody = error.response?.data;

    if (responseBody) {
      return {
        success: responseBody.success ?? false,
        message: responseBody.message ?? fallbackMessage,
        token: responseBody.token,
        userData: responseBody.userData,
      };
    }

    return {
      success: false,
      message: fallbackMessage,
    };
  }

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return this.buildErrorResponse(error, "Prijava nije uspela");
      }
      return { success: false, message: "Prijava nije uspela" };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<AuthResponse>("/auth/register", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return this.buildErrorResponse(error, "Registracija nije uspela");
      }
      return { success: false, message: "Registracija nije uspela" };
    }
  }
}
