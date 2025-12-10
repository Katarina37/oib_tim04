import { AxiosInstance } from "axios";
import { AuditLogPayload, IAuditClient } from "../../Domain/services/IAuditClient";

export class AxiosAuditClient implements IAuditClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async sendLog(payload: AuditLogPayload): Promise<void> {
    await this.httpClient.post("/api/v1/logs", payload);
  }
}
