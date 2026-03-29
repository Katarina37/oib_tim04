import { NotificationPriority } from "../enums/NotificationPriority";
import { NotificationTargetRole } from "../enums/NotificationTargetRole";

export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  priority: NotificationPriority;
  eventType: string;
  sourceService: string;
  targetRole: NotificationTargetRole | null;
  targetUserId: number | null;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
  metadata: Record<string, unknown> | null;
}
