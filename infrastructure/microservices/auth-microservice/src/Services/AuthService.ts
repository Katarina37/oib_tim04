import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";

export class AuthService implements IAuthService {
  private readonly saltRounds: number;

  constructor(private readonly userRepository: Repository<User>) {
    this.saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    console.log("[AuthService] Login attempt for:", data.username);

    const user = await this.userRepository.findOne({
      where: { username: data.username },
    });

    console.log("[AuthService] User found:", user ? "YES" : "NO");

    if (!user) {
      return { authenificated: false, message: "User not found" };
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    console.log("[AuthService] Password matches:", passwordMatches);

    if (!passwordMatches) {
      return { authenificated: false, message: "Invalid password" };
    }

    return {
      authenificated: true,
      userData: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      },
    };
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) {
      return {
        authenificated: false,
        message: "Username or email already exists",
      };
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

    return {
      authenificated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        firstName: savedUser.firstName ?? undefined,
        lastName: savedUser.lastName ?? undefined,
      },
    };
  }
}