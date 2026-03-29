import { Request, Response, Router } from "express";
import { INotificationService } from "../../Domain/services/INotificationService";
import {
  parseEventPayload,
  parseNotificationId,
  parseQuery,
  parseUserContext,
} from "../validators/NotificationValidator";

export class NotificationController {
  private readonly router: Router;

  constructor(private readonly notificationService: INotificationService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/notifications/internal/events", this.ingestEvent.bind(this));
    this.router.get("/notifications", this.getNotifications.bind(this));
    this.router.get("/notifications/unread-count", this.getUnreadCount.bind(this));
    this.router.patch("/notifications/:id/read", this.markAsRead.bind(this));
    this.router.patch("/notifications/read-all", this.markAllAsRead.bind(this));
    this.router.get("/notifications/email-log", this.getEmailLog.bind(this));
  }

  private async ingestEvent(req: Request, res: Response): Promise<void> {
    try {
      const payload = parseEventPayload(req.body as Record<string, unknown>);
      const notification = await this.notificationService.ingestEvent(payload);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userContext = parseUserContext(req.headers as unknown as Record<string, unknown>);
      const query = parseQuery(req.query as Record<string, unknown>);
      const notifications = await this.notificationService.getNotifications(userContext, query);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userContext = parseUserContext(req.headers as unknown as Record<string, unknown>);
      const count = await this.notificationService.getUnreadCount(userContext);
      res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userContext = parseUserContext(req.headers as unknown as Record<string, unknown>);
      const id = parseNotificationId(String(req.params.id));
      const notification = await this.notificationService.markAsRead(id, userContext);
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userContext = parseUserContext(req.headers as unknown as Record<string, unknown>);
      const updated = await this.notificationService.markAllAsRead(userContext);
      res.status(200).json({ success: true, data: { updated } });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getEmailLog(req: Request, res: Response): Promise<void> {
    try {
      const userContext = parseUserContext(req.headers as unknown as Record<string, unknown>);
      if (userContext.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "Only ADMIN can view email log." });
        return;
      }

      const limitRaw = req.query.limit;
      const limit =
        limitRaw !== undefined
          ? Math.max(1, Math.min(200, Number.parseInt(String(limitRaw), 10) || 50))
          : 50;

      const logs = await this.notificationService.getEmailLog(limit);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private handleError(res: Response, error: unknown): void {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.toLowerCase().includes("not found")
      ? 404
      : message.toLowerCase().includes("invalid") || message.toLowerCase().includes("required")
        ? 400
        : message.toLowerCase().includes("belong")
          ? 403
          : 500;

    res.status(status).json({ success: false, message });
  }
}
