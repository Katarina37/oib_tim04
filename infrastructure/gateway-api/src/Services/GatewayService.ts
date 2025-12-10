import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { IAuthClient } from "../Domain/clients/IAuthClient";
import { IUserClient } from "../Domain/clients/IUserClient";
import { IUserAccessPolicy } from "../Domain/services/IUserAccessPolicy";

export class GatewayService implements IGatewayService {
  constructor(
    private readonly authClient: IAuthClient,
    private readonly userClient: IUserClient,
    private readonly userAccessPolicy: IUserAccessPolicy
  ) {}

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      return await this.authClient.login(data);
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      return await this.authClient.register(data);
    } catch {
      return { authenificated: false };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    return this.userClient.getAll();
  }

  async getUserById(id: number, currentUserId?: number): Promise<UserDTO> {
    this.userAccessPolicy.ensureCanAccess(currentUserId, id);
    return this.userClient.getById(id);
  }

  // TODO: ADD MORE API CALLS
}
