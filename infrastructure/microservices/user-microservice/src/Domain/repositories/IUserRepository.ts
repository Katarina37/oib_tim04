import { UserSearchCriteriaDTO } from "../DTOs/UserSearchCriteriaDTO";
import { UserRole } from "../enums/UserRole";
import { User } from "../models/User";

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
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
  create(data: CreateUserData): User;
  save(user: User): Promise<User>;
  remove(user: User): Promise<void>;
  search(criteria: UserSearchCriteriaDTO): Promise<User[]>;
}
