import { NotificationPriority } from "../enums/NotificationPriority";

export interface NotificationQueryDTO {
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationUserContext {
  userId: number;
  role: string;
}
