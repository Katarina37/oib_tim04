import { UserDTO } from "../../models/users/UserDTO";

export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profileImage?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
export type UpdateCurrentUserPayload = Omit<UpdateUserPayload, "role">;

export interface UserSearchPayload {
  [key: string]: unknown;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface IUserAPI {
  getAllUsers(token: string): Promise<UserDTO[]>;
  getUserById(token: string, id: number): Promise<UserDTO>;
  getCurrentUser(token: string): Promise<UserDTO>;
  createUser(token: string, data: CreateUserPayload): Promise<UserDTO>;
  updateUser(token: string, id: number, data: UpdateUserPayload): Promise<UserDTO>;
  updateCurrentUser(token: string, data: UpdateCurrentUserPayload): Promise<UserDTO>;
  deleteUser(token: string, id: number): Promise<void>;
  searchUsers(token: string, criteria: UserSearchPayload): Promise<UserDTO[]>;
}
