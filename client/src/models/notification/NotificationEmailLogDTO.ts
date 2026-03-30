export interface NotificationEmailLogDTO {
  id: number;
  notificationId: number | null;
  subject: string;
  message: string;
  targetRole: string | null;
  targetUserId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
