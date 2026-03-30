import { IHttpClient } from "../http/IHttpClient";
import { NotificationDTO } from "../../models/notification/NotificationDTO";
import { NotificationEmailLogDTO } from "../../models/notification/NotificationEmailLogDTO";
import { NotificationQueryParams } from "../../models/notification/NotificationQueryParams";
import { INotificationAPI } from "./INotificationAPI";

export class NotificationAPI implements INotificationAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/notifications";

  private getAuthHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  private unwrapResponse<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }

    return data as T;
  }

  async getNotifications(token: string, query?: NotificationQueryParams): Promise<NotificationDTO[]> {
    const response = await this.httpClient.get<unknown>(this.basePath, {
      headers: this.getAuthHeaders(token),
      params: {
        ...(query?.priority ? { priority: query.priority } : {}),
        ...(query?.unreadOnly ? { unreadOnly: true } : {}),
      },
    });

    return this.unwrapResponse<NotificationDTO[]>(response);
  }

  async getUnreadCount(token: string): Promise<number> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/unread-count`, {
      headers: this.getAuthHeaders(token),
    });

    const payload = this.unwrapResponse<{ unreadCount: number }>(response);
    return payload.unreadCount;
  }

  async markAsRead(id: number, token: string): Promise<NotificationDTO> {
    const response = await this.httpClient.patch<unknown>(`${this.basePath}/${id}/read`, undefined, {
      headers: this.getAuthHeaders(token),
    });

    return this.unwrapResponse<NotificationDTO>(response);
  }

  async markAllAsRead(token: string): Promise<number> {
    const response = await this.httpClient.patch<unknown>(`${this.basePath}/read-all`, undefined, {
      headers: this.getAuthHeaders(token),
    });

    const payload = this.unwrapResponse<{ updated: number }>(response);
    return payload.updated;
  }

  async getEmailLog(token: string, limit = 50): Promise<NotificationEmailLogDTO[]> {
    const response = await this.httpClient.get<unknown>(`${this.basePath}/email-log`, {
      headers: this.getAuthHeaders(token),
      params: { limit },
    });

    return this.unwrapResponse<NotificationEmailLogDTO[]>(response);
  }
}
