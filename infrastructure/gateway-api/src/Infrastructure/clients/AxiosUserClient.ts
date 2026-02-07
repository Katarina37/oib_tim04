import { AxiosInstance } from "axios";
import { IUserClient } from "../../Domain/clients/IUserClient";
import { UserDTO } from "../../Domain/DTOs/UserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export class AxiosUserClient implements IUserClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  private unwrapData<T>(payload: T | ApiEnvelope<T>): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      const envelope = payload as ApiEnvelope<T>;
      if (envelope.data !== undefined) {
        return envelope.data;
      }
    }

    return payload as T;
  }

  async getAll(): Promise<UserDTO[]> {
    const response = await this.httpClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getById(id: number): Promise<UserDTO> {
    const response = await this.httpClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  async create(data: RegistrationUserDTO): Promise<UserDTO> {
    const response = await this.httpClient.post<ApiEnvelope<UserDTO>>("/users", data);
    return this.unwrapData<UserDTO>(response.data);
  }

  async update(id: number, data: Partial<RegistrationUserDTO>): Promise<UserDTO> {
    const response = await this.httpClient.put<ApiEnvelope<UserDTO>>(`/users/${id}`, data);
    return this.unwrapData<UserDTO>(response.data);
  }

  async delete(id: number): Promise<void> {
    await this.httpClient.delete(`/users/${id}`);
  }

  async search(criteria: Record<string, unknown>): Promise<UserDTO[]> {
    const response = await this.httpClient.get<UserDTO[]>("/users/search", {
      params: criteria,
    });
    return response.data;
  }
}
