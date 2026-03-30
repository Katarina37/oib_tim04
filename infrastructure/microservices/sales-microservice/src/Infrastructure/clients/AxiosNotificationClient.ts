import { AxiosInstance } from "axios";
import { INotificationClient, NotificationEventPayload } from "../../Domain/services/INotificationClient";

export class AxiosNotificationClient implements INotificationClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async sendEvent(payload: NotificationEventPayload): Promise<void> {
    await this.httpClient.post("/notifications/internal/events", payload);
  }
}
