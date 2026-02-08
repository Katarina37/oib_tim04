import { CreateAuditLogDTO } from "../../models/audit/CreateAuditLogDTO";
import { AuditLogDTO } from "../../models/audit/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../models/audit/AuditLogSearchCriteriaDTO";
import { UpdateAuditLogDTO } from "../../models/audit/UpdateAuditLogDTO";
import { IHttpClient } from "../http/IHttpClient";
import { IAuditAPI } from "./IAuditAPI";

export class AuditAPI implements IAuditAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/audit/logs";

  private getAuthHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  private unwrapResponse<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }
    return data as T;
  }

  private normalizeDate(value: Date | string): string {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid date value provided to audit search.");
    }
    return parsed.toISOString();
  }

  private buildQueryParams(criteria: AuditLogSearchCriteriaDTO): Record<string, unknown> {
    return {
      ...(criteria.tip_zapisa ? { tip_zapisa: criteria.tip_zapisa } : {}),
      ...(criteria.opis ? { opis: criteria.opis } : {}),
      ...(criteria.mikroservis ? { mikroservis: criteria.mikroservis } : {}),
      ...(criteria.korisnik_id !== undefined ? { korisnik_id: criteria.korisnik_id } : {}),
      ...(criteria.ip_adresa ? { ip_adresa: criteria.ip_adresa } : {}),
      ...(criteria.datum_od ? { datum_od: this.normalizeDate(criteria.datum_od) } : {}),
      ...(criteria.datum_do ? { datum_do: this.normalizeDate(criteria.datum_do) } : {}),
    };
  }

  async getAllLogs(token: string): Promise<AuditLogDTO[]> {
    const response = await this.httpClient.get<unknown>(this.basePath, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<AuditLogDTO[]>(response);
  }

  async getLogById(id: number, token: string): Promise<AuditLogDTO> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<AuditLogDTO>(response);
  }

  async createLog(data: CreateAuditLogDTO, token: string): Promise<AuditLogDTO> {
    const response = await this.httpClient.post<unknown>(this.basePath, data, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<AuditLogDTO>(response);
  }

  async updateLog(id: number, data: UpdateAuditLogDTO, token: string): Promise<AuditLogDTO> {
    const response = await this.httpClient.put<unknown>(`${this.basePath}/${id}`, data, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<AuditLogDTO>(response);
  }

  async deleteLog(id: number, token: string): Promise<void> {
    await this.httpClient.delete(`${this.basePath}/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async searchLogs(criteria: AuditLogSearchCriteriaDTO, token: string): Promise<AuditLogDTO[]> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/search`, {
      headers: this.getAuthHeaders(token),
      params: this.buildQueryParams(criteria),
    });

    return this.unwrapResponse<AuditLogDTO[]>(response);
  }
}
