import { UserDTO } from "../DTOs/UserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";

export interface IUserClient {
  getAll(): Promise<UserDTO[]>;
  getById(id: number): Promise<UserDTO>;
  create(data: RegistrationUserDTO): Promise<UserDTO>;
  update(id: number, data: Partial<RegistrationUserDTO>): Promise<UserDTO>;
  delete(id: number): Promise<void>;
  search(criteria: Record<string, unknown>): Promise<UserDTO[]>;
}
