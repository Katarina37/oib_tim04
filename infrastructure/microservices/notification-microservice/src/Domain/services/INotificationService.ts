import { CreateNotificationEventDTO } from "../DTOs/CreateNotificationEventDTO";
import { NotificationDTO } from "../DTOs/NotificationDTO";
import { NotificationEmailLogDTO } from "../DTOs/NotificationEmailLogDTO";
import { NotificationQueryDTO, NotificationUserContext } from "../DTOs/NotificationQueryDTO";

export interface INotificationService {
  ingestEvent(data: CreateNotificationEventDTO): Promise<NotificationDTO>;
  getNotifications(
    context: NotificationUserContext,
    query: NotificationQueryDTO
  ): Promise<NotificationDTO[]>;
  getUnreadCount(context: NotificationUserContext): Promise<number>;
  markAsRead(id: number, context: NotificationUserContext): Promise<NotificationDTO>;
  markAllAsRead(context: NotificationUserContext): Promise<number>;
  getEmailLog(limit: number): Promise<NotificationEmailLogDTO[]>;
}
