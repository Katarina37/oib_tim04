import bcrypt from "bcryptjs";
import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { CreateUserDTO } from "../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../Domain/DTOs/UpdateUserDTO";
import { UserSearchCriteriaDTO } from "../Domain/DTOs/UserSearchCriteriaDTO";
import { IUserRepository } from "../Domain/repositories/IUserRepository";

export class UsersService implements IUsersService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly saltRounds: number
  ) {}

  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => this.toDTO(u));
  }

  async getUserById(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.toDTO(user);
  }

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    const existingUser = await this.userRepository.findByUsernameOrEmail(
      data.username,
      data.email
    );

    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(newUser);
    return this.toDTO(savedUser);
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(
        data.username
      );
      if (existingUsername) {
        throw new Error("Username already exists");
      }
      user.username = data.username;
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error("Email already exists");
      }
      user.email = data.email;
    }

    if (data.firstName !== undefined) {
      user.firstName = data.firstName ?? null;
    }

    if (data.lastName !== undefined) {
      user.lastName = data.lastName ?? null;
    }

    if (data.role !== undefined) {
      user.role = data.role;
    }

    if (data.profileImage !== undefined) {
      user.profileImage = data.profileImage ?? null;
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, this.saltRounds);
    }

    const updatedUser = await this.userRepository.save(user);
    return this.toDTO(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
  }

  async searchUsers(criteria: UserSearchCriteriaDTO): Promise<UserDTO[]> {
    const users = await this.userRepository.search(criteria);
    return users.map((u) => this.toDTO(u));
  }

  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage,
    };
  }
}
