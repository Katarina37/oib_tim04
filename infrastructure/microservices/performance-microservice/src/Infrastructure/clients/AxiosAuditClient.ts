import { AxiosInstance } from "axios";
import { AuditLogPayload, IAuditClient } from "../../Domain/services/IAuditClient";

export class AxiosAuditClient implements IAuditClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async sendLog(payload: AuditLogPayload): Promise<void> {
    const dto = {
      tip_zapisa: payload.tipZapisa,
      opis: payload.opis,
      mikroservis: payload.mikroservis,
      korisnik_id: payload.korisnikId,
      ip_adresa: payload.ipAdresa,
      dodatni_podaci: payload.dodatniPodaci,
    };

    await this.httpClient.post("/logs", dto);
  }
}
