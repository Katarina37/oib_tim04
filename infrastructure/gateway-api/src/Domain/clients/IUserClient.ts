import { UserDTO } from "../DTOs/UserDTO";

export interface IUserClient {
  getAll(): Promise<UserDTO[]>;
  getById(id: number): Promise<UserDTO>;
}
