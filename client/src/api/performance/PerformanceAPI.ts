import { IPerformanceAPI } from "./IPerformanceAPI";
import { IHttpClient } from "../http/IHttpClient";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";
import { CreatePerformanceParams } from "../../models/performance/CreatePerformanceParams";

export class PerformanceAPI implements IPerformanceAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/performance-analysis";
  private readonly baseURL = import.meta.env.VITE_GATEWAY_URL;

  private getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private unwrapResponse<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }

    return data as T;
  }

  async runSimulation(data: CreatePerformanceParams, token: string): Promise<PerformanceReportDTO> {
    const response = await this.httpClient.post<unknown>(
      `${this.basePath}/simulations`,
      data,
      { headers: this.getAuthHeaders(token) }
    );

    return this.unwrapResponse<PerformanceReportDTO>(response);
  }

  async getReports(token: string): Promise<PerformanceReportDTO[]> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/reports`, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<PerformanceReportDTO[]>(response);
  }

  async exportPerformancePDF(id: number, token: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}${this.basePath}/reports/${id}/pdf`, {
      headers: {
        ...this.getAuthHeaders(token),
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export PDF: ${response.statusText}`);
    }

    return response.blob();
  }
}

