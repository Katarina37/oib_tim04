import { AxiosInstance } from "axios";
import { AuditLogDTO } from "../../Domain/DTOs/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../Domain/DTOs/AuditLogSearchCriteriaDTO";
import { IAuditSearchClient } from "../../Domain/services/IAuditSearchClient";

interface AuditSearchResponse {
  success: boolean;
  data: AuditLogDTO[];
}

export class AxiosAuditSearchClient implements IAuditSearchClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async searchLogs(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLogDTO[]> {
    const response = await this.httpClient.get<AuditSearchResponse>("/logs/search", {
      params: {
        ...(criteria.tip_zapisa ? { tip_zapisa: criteria.tip_zapisa } : {}),
        ...(criteria.opis ? { opis: criteria.opis } : {}),
        ...(criteria.mikroservis ? { mikroservis: criteria.mikroservis } : {}),
        ...(criteria.korisnik_id ? { korisnik_id: criteria.korisnik_id } : {}),
        ...(criteria.ip_adresa ? { ip_adresa: criteria.ip_adresa } : {}),
        ...(criteria.datum_od ? { datum_od: criteria.datum_od } : {}),
        ...(criteria.datum_do ? { datum_do: criteria.datum_do } : {}),
      },
    });

    return response.data.data ?? [];
  }
}
