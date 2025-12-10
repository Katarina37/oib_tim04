import { AxiosInstance } from "axios";
import { IUserClient } from "../../Domain/clients/IUserClient";
import { UserDTO } from "../../Domain/DTOs/UserDTO";

export class AxiosUserClient implements IUserClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getAll(): Promise<UserDTO[]> {
    const response = await this.httpClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getById(id: number): Promise<UserDTO> {
    const response = await this.httpClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }
}
