import { NotificationQueryDTO, NotificationUserContext } from "../DTOs/NotificationQueryDTO";
import { Notification } from "../models/Notification";
import { NotificationEmailLog } from "../models/NotificationEmailLog";

export interface INotificationRepository {
  create(data: Partial<Notification>): Notification;
  save(notification: Notification): Promise<Notification>;
  findById(id: number): Promise<Notification | null>;
  getForUser(
    context: NotificationUserContext,
    query: NotificationQueryDTO
  ): Promise<Notification[]>;
  countUnreadForUser(context: NotificationUserContext): Promise<number>;
  markAllAsReadForUser(context: NotificationUserContext): Promise<number>;
  createEmailLog(data: Partial<NotificationEmailLog>): NotificationEmailLog;
  saveEmailLog(log: NotificationEmailLog): Promise<NotificationEmailLog>;
  getEmailLogs(limit: number): Promise<NotificationEmailLog[]>;
}
