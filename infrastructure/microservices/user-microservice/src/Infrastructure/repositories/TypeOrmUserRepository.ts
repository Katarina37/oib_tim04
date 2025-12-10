import { Repository, FindOptionsWhere, Like } from "typeorm";
import { IUserRepository, CreateUserData } from "../../Domain/repositories/IUserRepository";
import { User } from "../../Domain/models/User";
import { UserSearchCriteriaDTO } from "../../Domain/DTOs/UserSearchCriteriaDTO";

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<User>) {}

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
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

  async remove(user: User): Promise<void> {
    await this.repository.remove(user);
  }

  search(criteria: UserSearchCriteriaDTO): Promise<User[]> {
    const where: FindOptionsWhere<User> = {};

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

    return this.repository.find({ where });
  }
}
