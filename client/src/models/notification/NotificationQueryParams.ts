import { NotificationPriority } from "./NotificationPriority";

export interface NotificationQueryParams {
  priority?: NotificationPriority;
  unreadOnly?: boolean;
}
