import { Request, Response, Router } from "express";
import { DomainError } from "../../Domain/errors/DomainError";
import { IAuditService } from "../../Domain/services/IAuditService";
import {
  parseAuditLogId,
  parseAuditSearchCriteria,
  parseCreateAuditLogData,
  parseUpdateAuditLogData,
} from "../validators/AuditLogValidator";

export class AuditController {
  private readonly router: Router;

  constructor(private readonly auditService: IAuditService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/logs", this.getAllLogs.bind(this));
    this.router.get("/logs/search", this.searchLogs.bind(this));
    this.router.get("/logs/:id", this.getLogById.bind(this));
    this.router.post("/logs", this.createLog.bind(this));
    this.router.put("/logs/:id", this.updateLog.bind(this));
    this.router.delete("/logs/:id", this.deleteLog.bind(this));
  }

  private async getAllLogs(_req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.auditService.getAllLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseAuditLogId(req.params.id);
      const log = await this.auditService.getLogById(id);
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async createLog(req: Request, res: Response): Promise<void> {
    try {
      const data = parseCreateAuditLogData(req.body);
      const log = await this.auditService.createLog(data);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseAuditLogId(req.params.id);
      const data = parseUpdateAuditLogData(req.body);
      const log = await this.auditService.updateLog(id, data);
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseAuditLogId(req.params.id);
      await this.auditService.deleteLog(id);
      res.status(200).json({ success: true, message: "Audit log deleted successfully." });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async searchLogs(req: Request, res: Response): Promise<void> {
    try {
      const criteria = parseAuditSearchCriteria(req.query as Record<string, unknown>);
      const logs = await this.auditService.searchLogs(criteria);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof DomainError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }

    const message =
      error instanceof Error ? error.message : "Unexpected error while processing request.";
    res.status(500).json({ success: false, message });
  }
}
