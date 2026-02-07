import { Repository } from "typeorm";
import { IUserRepository, CreateUserData } from "../../Domain/repositories/IUserRepository";
import { User } from "../../Domain/models/User";
import { UserEntity } from "../entities/UserEntity";

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<UserEntity>) {}

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { username } });
    return user ? this.toDomain(user) : null;
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: [{ username }, { email }] });
    return user ? this.toDomain(user) : null;
  }

  create(data: CreateUserData): User {
    const entity = this.repository.create({
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role,
      profileImage: data.profileImage ?? null,
    });
    return this.toDomain(entity);
  }

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(this.toEntity(user));
    return this.toDomain(saved);
  }

  private toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      username: entity.username,
      password: entity.password,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role,
      profileImage: entity.profileImage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.username = user.username;
    entity.password = user.password;
    entity.email = user.email;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.role = user.role;
    entity.profileImage = user.profileImage;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}
