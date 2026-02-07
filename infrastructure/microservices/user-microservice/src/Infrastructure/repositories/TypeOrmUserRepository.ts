import { Repository, FindOptionsWhere, Like } from "typeorm";
import { IUserRepository, CreateUserData } from "../../Domain/repositories/IUserRepository";
import { User } from "../../Domain/models/User";
import { UserSearchCriteriaDTO } from "../../Domain/DTOs/UserSearchCriteriaDTO";
import { UserEntity } from "../entities/UserEntity";

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<UserEntity>) {}

  async findAll(): Promise<User[]> {
    const users = await this.repository.find();
    return users.map((user) => this.toDomain(user));
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { username } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { email } });
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

  async remove(user: User): Promise<void> {
    await this.repository.remove(this.toEntity(user));
  }

  async search(criteria: UserSearchCriteriaDTO): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};

    if (criteria.username) {
      where.username = Like(`%${criteria.username}%`);
    }

    if (criteria.email) {
      where.email = Like(`%${criteria.email}%`);
    }

    if (criteria.firstName) {
      where.firstName = Like(`%${criteria.firstName}%`);
    }

    if (criteria.lastName) {
      where.lastName = Like(`%${criteria.lastName}%`);
    }

    if (criteria.role) {
      where.role = criteria.role;
    }

    const users = await this.repository.find({ where });
    return users.map((user) => this.toDomain(user));
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
