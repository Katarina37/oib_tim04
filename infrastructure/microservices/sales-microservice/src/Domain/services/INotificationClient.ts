export interface NotificationEventPayload {
  eventType: string;
  sourceService: string;
  title?: string;
  message: string;
  priority?: "INFO" | "WARNING" | "ERROR";
  targetRole?: "ADMIN" | "SALES_MANAGER" | "SELLER";
  targetUserId?: number;
  metadata?: Record<string, unknown>;
  simulateEmail?: boolean;
}

export interface INotificationClient {
  sendEvent(payload: NotificationEventPayload): Promise<void>;
}
