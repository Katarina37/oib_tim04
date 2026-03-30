import { NotificationDTO } from "../../models/notification/NotificationDTO";
import { NotificationEmailLogDTO } from "../../models/notification/NotificationEmailLogDTO";
import { NotificationQueryParams } from "../../models/notification/NotificationQueryParams";

export interface INotificationAPI {
  getNotifications(token: string, query?: NotificationQueryParams): Promise<NotificationDTO[]>;
  getUnreadCount(token: string): Promise<number>;
  markAsRead(id: number, token: string): Promise<NotificationDTO>;
  markAllAsRead(token: string): Promise<number>;
  getEmailLog(token: string, limit?: number): Promise<NotificationEmailLogDTO[]>;
}
