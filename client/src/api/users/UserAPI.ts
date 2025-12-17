import { IUserAPI } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";
import { IHttpClient } from "../http/IHttpClient";

export class UserAPI implements IUserAPI {
  constructor(private readonly httpClient: IHttpClient) {}

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
}
