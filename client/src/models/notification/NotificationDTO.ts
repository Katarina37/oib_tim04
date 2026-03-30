import { NotificationPriority } from "./NotificationPriority";
import { NotificationTargetRole } from "./NotificationTargetRole";

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
  createdAt: string;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
}
