import { Repository } from "typeorm";
import { IUserRepository, CreateUserData } from "../../Domain/repositories/IUserRepository";
import { User } from "../../Domain/models/User";

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<User>) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    return this.repository.findOne({ where: [{ username }, { email }] });
  }

  create(data: CreateUserData): User {
    return this.repository.create({
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role,
      profileImage: data.profileImage ?? null,
    });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
