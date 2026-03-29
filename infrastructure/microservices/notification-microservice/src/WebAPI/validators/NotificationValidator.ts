import { CreateNotificationEventDTO } from "../../Domain/DTOs/CreateNotificationEventDTO";
import { NotificationQueryDTO, NotificationUserContext } from "../../Domain/DTOs/NotificationQueryDTO";
import { NotificationPriority } from "../../Domain/enums/NotificationPriority";
import { NotificationTargetRole } from "../../Domain/enums/NotificationTargetRole";

const parsePositiveInt = (value: unknown, fieldName: string): number => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return parsed;
};

export const parseUserContext = (headers: Record<string, unknown>): NotificationUserContext => {
  const userId = headers["x-user-id"];
  const role = headers["x-user-role"];

  if (!userId || !role) {
    throw new Error("Missing user context headers (X-User-Id, X-User-Role).");
  }

  const normalizedRole = String(role).toUpperCase().trim();
  if (!Object.values(NotificationTargetRole).includes(normalizedRole as NotificationTargetRole)) {
    throw new Error("Invalid user role header.");
  }

  return {
    userId: parsePositiveInt(userId, "X-User-Id"),
    role: normalizedRole,
  };
};

export const parseQuery = (query: Record<string, unknown>): NotificationQueryDTO => {
  const parsed: NotificationQueryDTO = {};

  if (typeof query.priority === "string") {
    const normalizedPriority = query.priority.toUpperCase().trim();
    if (!Object.values(NotificationPriority).includes(normalizedPriority as NotificationPriority)) {
      throw new Error("Invalid priority filter.");
    }
    parsed.priority = normalizedPriority as NotificationPriority;
  }

  if (query.unreadOnly !== undefined) {
    const value = String(query.unreadOnly).toLowerCase();
    parsed.unreadOnly = value === "true" || value === "1";
  }

  if (query.limit !== undefined) {
    parsed.limit = parsePositiveInt(query.limit, "limit");
  }

  if (query.offset !== undefined) {
    const offset = Number.parseInt(String(query.offset), 10);
    if (!Number.isInteger(offset) || offset < 0) {
      throw new Error("offset must be zero or positive integer.");
    }
    parsed.offset = offset;
  }

  return parsed;
};

export const parseNotificationId = (value: string): number => {
  return parsePositiveInt(value, "notificationId");
};

export const parseEventPayload = (body: Record<string, unknown>): CreateNotificationEventDTO => {
  const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
  const sourceService = typeof body.sourceService === "string" ? body.sourceService.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!eventType || !sourceService || !message) {
    throw new Error("eventType, sourceService and message are required.");
  }

  const payload: CreateNotificationEventDTO = {
    eventType,
    sourceService,
    message,
  };

  if (typeof body.title === "string" && body.title.trim()) {
    payload.title = body.title.trim();
  }

  if (typeof body.priority === "string") {
    const priority = body.priority.toUpperCase().trim();
    if (!Object.values(NotificationPriority).includes(priority as NotificationPriority)) {
      throw new Error("Invalid priority value.");
    }
    payload.priority = priority as NotificationPriority;
  }

  if (typeof body.targetRole === "string") {
    const role = body.targetRole.toUpperCase().trim();
    if (!Object.values(NotificationTargetRole).includes(role as NotificationTargetRole)) {
      throw new Error("Invalid targetRole value.");
    }
    payload.targetRole = role as NotificationTargetRole;
  }

  if (body.targetUserId !== undefined && body.targetUserId !== null) {
    payload.targetUserId = parsePositiveInt(body.targetUserId, "targetUserId");
  }

  if (body.metadata && typeof body.metadata === "object") {
    payload.metadata = body.metadata as Record<string, unknown>;
  }

  if (body.simulateEmail !== undefined) {
    payload.simulateEmail = Boolean(body.simulateEmail);
  }

  return payload;
};
