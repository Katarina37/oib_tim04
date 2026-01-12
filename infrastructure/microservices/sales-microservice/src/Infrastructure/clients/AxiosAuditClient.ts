import { AxiosInstance } from "axios";
import { AuditLogPayload, IAuditClient } from "../../Domain/services/IAuditClient";

export class AxiosAuditClient implements IAuditClient {
    constructor(private readonly httpClient: AxiosInstance) {}

    async sendLog(payload: AuditLogPayload): Promise<void> {
        try {
            const response = await this.httpClient.post('/logs', payload);
            if (response.status === 201 || response.status === 200) {
            console.log("AUDIT: Log je uspešno sačuvan u bazu drugog servisa!");
            }
        } catch (error: any) {
            if (error.response) {
               console.error("AUDIT GREŠKA:", error.response.status, error.response.data);
            } else {
               console.error("KONEKCIJA: Audit servis nije odgovorio.");
            }
        }
    }
}