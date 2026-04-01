import { IGatewayService } from "../Domain/services/IGatewayService";
import { IAuthClient } from "../Domain/clients/IAuthClient";
import { IUserClient } from "../Domain/clients/IUserClient";
import { IMicroserviceClient, ProxyRequest, ProxyResponse } from "../Domain/clients/IMicroserviceClient";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { AuthResponse } from "../Domain/types/AuthResponse";

export class GatewayService implements IGatewayService {
  constructor(
    private readonly authClient: IAuthClient,
    private readonly userClient: IUserClient,
    private readonly productionClient: IMicroserviceClient,
    private readonly processingClient: IMicroserviceClient,
    private readonly packagingClient: IMicroserviceClient,
    private readonly storageClient: IMicroserviceClient,
    private readonly salesClient: IMicroserviceClient,
    private readonly dataAnalysisClient: IMicroserviceClient,
    private readonly performanceAnalysisClient: IMicroserviceClient,
    private readonly auditClient: IMicroserviceClient,
    private readonly weatherClient: IMicroserviceClient,
    private readonly securityIncidentClient: IMicroserviceClient,
    private readonly notificationClient: IMicroserviceClient,
    private readonly recommendationClient: IMicroserviceClient
  ) {}

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    try {
      return await this.authClient.login(data);
    } catch {
      return { success: false, message: "Greska prilikom prijave" };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponse> {
    try {
      return await this.authClient.register(data);
    } catch {
      return { success: false, message: "Greska prilikom registracije" };
    }
  }

  async getAllUsers(): Promise<UserDTO[]> {
    return this.userClient.getAll();
  }

  async searchUsers(criteria: Record<string, unknown>): Promise<UserDTO[]> {
    return this.userClient.search(criteria);
  }

  async getUserById(id: number): Promise<UserDTO> {
    return this.userClient.getById(id);
  }

  async createUser(data: RegistrationUserDTO): Promise<UserDTO> {
    return this.userClient.create(data);
  }

  async updateUser(id: number, data: Partial<RegistrationUserDTO>): Promise<UserDTO> {
    return this.userClient.update(id, data);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userClient.delete(id);
  }

  async proxyToProduction(request: ProxyRequest): Promise<ProxyResponse> {
    return this.productionClient.proxy(request);
  }

  async proxyToProcessing(request: ProxyRequest): Promise<ProxyResponse> {
    return this.processingClient.proxy(request);
  }

  async proxyToStorage(request: ProxyRequest): Promise<ProxyResponse> {
    return this.storageClient.proxy(request);
  }

  async proxyToPackaging(request: ProxyRequest): Promise<ProxyResponse> {
    return this.packagingClient.proxy(request);
  }

  async proxyToSales(request: ProxyRequest): Promise<ProxyResponse> {
    return this.salesClient.proxy(request);
  }

  async proxyToDataAnalysis(request: ProxyRequest): Promise<ProxyResponse> {
    return this.dataAnalysisClient.proxy(request);
  }

  async proxyToPerformanceAnalysis(request: ProxyRequest): Promise<ProxyResponse> {
    return this.performanceAnalysisClient.proxy(request);
  }

  async proxyToAudit(request: ProxyRequest): Promise<ProxyResponse> {
    return this.auditClient.proxy(request);
  }

  async proxyToWeather(request: ProxyRequest): Promise<ProxyResponse> {
    return this.weatherClient.proxy(request);
  }

  async proxyToSecurityIncidents(request: ProxyRequest): Promise<ProxyResponse> {
    return this.securityIncidentClient.proxy(request);
  }

  async proxyToNotifications(request: ProxyRequest): Promise<ProxyResponse> {
    return this.notificationClient.proxy(request);
  }

  async proxyToRecommendations(request: ProxyRequest): Promise<ProxyResponse> {
    return this.recommendationClient.proxy(request);
  }
}
