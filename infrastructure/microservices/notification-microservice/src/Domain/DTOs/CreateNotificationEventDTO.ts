import { NotificationPriority } from "../enums/NotificationPriority";
import { NotificationTargetRole } from "../enums/NotificationTargetRole";

export interface CreateNotificationEventDTO {
  eventType: string;
  sourceService: string;
  title?: string;
  message: string;
  priority?: NotificationPriority;
  priorityHint?: NotificationPriority;
  targetRole?: NotificationTargetRole;
  targetUserId?: number;
  metadata?: Record<string, unknown>;
  simulateEmail?: boolean;
}
