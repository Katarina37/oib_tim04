import { CreateNotificationEventDTO } from "../Domain/DTOs/CreateNotificationEventDTO";
import { NotificationDTO } from "../Domain/DTOs/NotificationDTO";
import { NotificationEmailLogDTO } from "../Domain/DTOs/NotificationEmailLogDTO";
import { NotificationQueryDTO, NotificationUserContext } from "../Domain/DTOs/NotificationQueryDTO";
import { NotificationPriority } from "../Domain/enums/NotificationPriority";
import { Notification } from "../Domain/models/Notification";
import { NotificationEmailLog } from "../Domain/models/NotificationEmailLog";
import { INotificationRepository } from "../Domain/repositories/INotificationRepository";
import { INotificationService } from "../Domain/services/INotificationService";

export class NotificationService implements INotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  async ingestEvent(data: CreateNotificationEventDTO): Promise<NotificationDTO> {
    if (!data.eventType || !data.sourceService || !data.message) {
      throw new Error("eventType, sourceService and message are required.");
    }

    const notification = this.repository.create({
      title: (data.title ?? this.deriveTitle(data.eventType)).trim().slice(0, 160),
      message: data.message.trim(),
      priority: data.priority ?? data.priorityHint ?? this.mapPriorityByEvent(data.eventType),
      eventType: data.eventType.trim(),
      sourceService: data.sourceService.trim(),
      targetRole: data.targetRole ?? null,
      targetUserId: data.targetUserId ?? null,
      isRead: false,
      readAt: null,
      metadata: data.metadata ?? null,
    });

    const saved = await this.repository.save(notification);

    if (data.simulateEmail !== false) {
      await this.simulateEmail(saved);
    }

    return this.toDTO(saved);
  }

  async getNotifications(
    context: NotificationUserContext,
    query: NotificationQueryDTO
  ): Promise<NotificationDTO[]> {
    const notifications = await this.repository.getForUser(context, query);
    return notifications.map((notification) => this.toDTO(notification));
  }

  async getUnreadCount(context: NotificationUserContext): Promise<number> {
    return this.repository.countUnreadForUser(context);
  }

  async markAsRead(id: number, context: NotificationUserContext): Promise<NotificationDTO> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new Error(`Notification with id=${id} not found.`);
    }

    const isTargetUser =
      notification.targetUserId === null || notification.targetUserId === context.userId;
    const isTargetRole =
      notification.targetRole === null || notification.targetRole === context.role;

    if (!isTargetUser || !isTargetRole) {
      throw new Error("Notification does not belong to current user context.");
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.repository.save(notification);
    }

    return this.toDTO(notification);
  }

  markAllAsRead(context: NotificationUserContext): Promise<number> {
    return this.repository.markAllAsReadForUser(context);
  }

  async getEmailLog(limit: number): Promise<NotificationEmailLogDTO[]> {
    const records = await this.repository.getEmailLogs(limit);
    return records.map((record) => this.toEmailLogDTO(record));
  }

  private async simulateEmail(notification: Notification): Promise<void> {
    const emailLog = this.repository.createEmailLog({
      notificationId: notification.id,
      subject: `[${notification.priority}] ${notification.title}`,
      message: notification.message,
      targetRole: notification.targetRole,
      targetUserId: notification.targetUserId,
      metadata: notification.metadata,
    });

    await this.repository.saveEmailLog(emailLog);
  }

  private mapPriorityByEvent(eventType: string): NotificationPriority {
    const normalized = eventType.toUpperCase();

    if (normalized.includes("ERROR") || normalized.includes("FAILED")) {
      return NotificationPriority.ERROR;
    }

    if (
      normalized.includes("WARNING") ||
      normalized.includes("LOW") ||
      normalized.includes("INSUFFICIENT")
    ) {
      return NotificationPriority.WARNING;
    }

    return NotificationPriority.INFO;
  }

  private deriveTitle(eventType: string): string {
    return eventType
      .trim()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  private toDTO(notification: Notification): NotificationDTO {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      eventType: notification.eventType,
      sourceService: notification.sourceService,
      targetRole: notification.targetRole,
      targetUserId: notification.targetUserId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      metadata: notification.metadata,
    };
  }

  private toEmailLogDTO(log: NotificationEmailLog): NotificationEmailLogDTO {
    return {
      id: log.id,
      notificationId: log.notificationId,
      subject: log.subject,
      message: log.message,
      targetRole: log.targetRole,
      targetUserId: log.targetUserId,
      metadata: log.metadata,
      createdAt: log.createdAt,
    };
  }
}
