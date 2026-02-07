import { IUserAPI } from "./IUserAPI";
import { CreateUserPayload, UpdateUserPayload, UserSearchPayload } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";
import { IHttpClient } from "../http/IHttpClient";

export class UserAPI implements IUserAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private unwrapResponse<T>(payload: unknown): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  }

  async getAllUsers(token: string): Promise<UserDTO[]> {
    return this.httpClient.get<UserDTO[]>("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getUserById(token: string, id: number): Promise<UserDTO> {
    return this.httpClient.get<UserDTO>(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createUser(token: string, data: CreateUserPayload): Promise<UserDTO> {
    const response = await this.httpClient.post<unknown>("/users", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.unwrapResponse<UserDTO>(response);
  }

  async updateUser(token: string, id: number, data: UpdateUserPayload): Promise<UserDTO> {
    const response = await this.httpClient.put<unknown>(`/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.unwrapResponse<UserDTO>(response);
  }

  async deleteUser(token: string, id: number): Promise<void> {
    await this.httpClient.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async searchUsers(token: string, criteria: UserSearchPayload): Promise<UserDTO[]> {
    return this.httpClient.get<UserDTO[]>("/users/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: criteria,
    });
  }
}
