import { IHttpClient } from "../http/IHttpClient";
import { IProcessingAPI } from "./IProcessingAPI";
import {
  PerfumeBatchDTO,
  PerfumeDTO,
  PerfumeSearchCriteriaDTO,
  ProcessingStatsDTO,
  ProcessingSummaryDTO,
  RequestPerfumesDTO,
  StartProcessingDTO,
} from "../../models/processing/ProcessingDTO";

export class ProcessingAPI implements IProcessingAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/processing";

  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private unwrapResponse<T>(payload: unknown): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  }

  private buildQueryParams(criteria?: PerfumeSearchCriteriaDTO): Record<string, unknown> | undefined {
    if (!criteria) {
      return undefined;
    }

    return {
      ...(criteria.perfumeName ? { perfumeName: criteria.perfumeName } : {}),
      ...(criteria.perfumeType ? { perfumeType: criteria.perfumeType } : {}),
      ...(criteria.bottleVolumeMl ? { bottleVolumeMl: criteria.bottleVolumeMl } : {}),
      ...(criteria.onlyAvailableForPackaging !== undefined
        ? { onlyAvailableForPackaging: criteria.onlyAvailableForPackaging }
        : {}),
      ...(criteria.sortBy ? { sortBy: criteria.sortBy } : {}),
      ...(criteria.sortDirection ? { sortDirection: criteria.sortDirection } : {}),
    };
  }

  async startProcessing(data: StartProcessingDTO, token: string): Promise<ProcessingSummaryDTO> {
    const response = await this.httpClient.post<ProcessingSummaryDTO>(
      `${this.basePath}/start`,
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return this.unwrapResponse<ProcessingSummaryDTO>(response);
  }

  async requestPerfumes(data: RequestPerfumesDTO, token: string): Promise<PerfumeBatchDTO> {
    const response = await this.httpClient.post<PerfumeBatchDTO>(
      `${this.basePath}/request-perfumes`,
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return this.unwrapResponse<PerfumeBatchDTO>(response);
  }

  async getPerfumes(token: string, criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]> {
    const response = await this.httpClient.get<PerfumeDTO[]>(
      `${this.basePath}/perfumes`,
      {
        headers: this.getAuthHeaders(token),
        params: this.buildQueryParams(criteria),
      }
    );

    return this.unwrapResponse<PerfumeDTO[]>(response);
  }

  async getStats(token: string): Promise<ProcessingStatsDTO> {
    const response = await this.httpClient.get<ProcessingStatsDTO>(
      `${this.basePath}/stats`,
      { headers: this.getAuthHeaders(token) }
    );

    return this.unwrapResponse<ProcessingStatsDTO>(response);
  }
}
