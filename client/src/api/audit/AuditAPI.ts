import { IHttpClient } from "../http/IHttpClient";
import { IAuditAPI } from "./IAuditAPI";
import { AuditLogDTO } from "../../models/audit/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../models/audit/AuditLogSearchCriteriaDTO";

export class AuditAPI implements IAuditAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/audit";

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private unwrapResponse<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }
    return data as T;
  }

  private normalizeDate(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    const parsed = new Date(value);
    return parsed.toISOString();
  }

  private buildQueryParams(criteria: AuditLogSearchCriteriaDTO): Record<string, unknown> {
    return {
      ...(criteria.tip_zapisa ? { tip_zapisa: criteria.tip_zapisa } : {}),
      ...(criteria.mikroservis ? { mikroservis: criteria.mikroservis } : {}),
      ...(criteria.korisnik_id !== undefined ? { korisnik_id: criteria.korisnik_id } : {}),
      ...(criteria.datum_od ? { datum_od: this.normalizeDate(criteria.datum_od) } : {}),
      ...(criteria.datum_do ? { datum_do: this.normalizeDate(criteria.datum_do) } : {}),
    };
  }

  async searchLogs(criteria: AuditLogSearchCriteriaDTO, token: string): Promise<AuditLogDTO[]> {
    const response = await this.httpClient.get<AuditLogDTO[]>(`${this.basePath}/logs/search`, {
      headers: this.getAuthHeaders(token),
      params: this.buildQueryParams(criteria),
    });

    return this.unwrapResponse<AuditLogDTO[]>(response);
  }
}
