import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponse } from "../types/AuthResponse";
import { ProxyRequest, ProxyResponse } from "../clients/IMicroserviceClient";

export interface IGatewayService {
  // Auth operations
  login(data: LoginUserDTO): Promise<AuthResponse>;
  register(data: RegistrationUserDTO): Promise<AuthResponse>;

  // User operations
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Proxy operations for other microservices
  proxyToProduction(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToProcessing(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToStorage(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToSales(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToDataAnalysis(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToPerformanceAnalysis(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToAudit(request: ProxyRequest): Promise<ProxyResponse>;
}