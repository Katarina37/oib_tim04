import { UserDTO } from "../DTOs/UserDTO";

export interface IUserClient {
  getAll(): Promise<UserDTO[]>;
  getById(id: number): Promise<UserDTO>;
  update(id: number, data: Partial<UserDTO>): Promise<UserDTO>;
  delete(id: number): Promise<void>;
  search(criteria: Record<string, unknown>): Promise<UserDTO[]>;
}