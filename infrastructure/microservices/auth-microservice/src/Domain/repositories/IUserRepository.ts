import { User } from "../models/User";
import { UserRole } from "../enums/UserRole";

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  profileImage?: string | null;
}

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
  create(data: CreateUserData): User;
  save(user: User): Promise<User>;
}
