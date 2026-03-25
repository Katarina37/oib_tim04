import { IHttpClient } from "../http/IHttpClient";
import { IncidentStatus } from "../../models/security_incidents/IncidentStatus";
import { SecurityIncidentDTO } from "../../models/security_incidents/SecurityIncidentDTO";
import { SecurityIncidentScanResultDTO } from "../../models/security_incidents/SecurityIncidentScanResultDTO";
import { ISecurityIncidentAPI } from "./ISecurityIncidentAPI";

export class SecurityIncidentAPI implements ISecurityIncidentAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/security-incidents";

  private getAuthHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  private unwrapResponse<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }

    return data as T;
  }

  async getAll(token: string): Promise<SecurityIncidentDTO[]> {
    const response = await this.httpClient.get<unknown>(this.basePath, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<SecurityIncidentDTO[]>(response);
  }

  async getOpen(token: string): Promise<SecurityIncidentDTO[]> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/open`, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<SecurityIncidentDTO[]>(response);
  }

  async getById(id: number, token: string): Promise<SecurityIncidentDTO> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/${id}`, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<SecurityIncidentDTO>(response);
  }

  async updateStatus(
    id: number,
    status: IncidentStatus,
    token: string
  ): Promise<SecurityIncidentDTO> {
    const response = await this.httpClient.patch<unknown>(
      `${this.basePath}/${id}/status`,
      { status },
      {
        headers: this.getAuthHeaders(token),
      }
    );

    return this.unwrapResponse<SecurityIncidentDTO>(response);
  }

  async runScan(
    lookbackMinutes: number | undefined,
    token: string
  ): Promise<SecurityIncidentScanResultDTO> {
    const payload = lookbackMinutes ? { lookbackMinutes } : {};
    const response = await this.httpClient.post<unknown>(`${this.basePath}/scan`, payload, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<SecurityIncidentScanResultDTO>(response);
  }
}
