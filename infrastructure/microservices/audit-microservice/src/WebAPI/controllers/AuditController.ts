import { Router, Request, Response } from "express";
import { IAuditService } from "../../Domain/services/IAuditService";
import { CreateAuditLogDTO } from "../../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../../Domain/DTOs/UpdateAuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../../Domain/DTOs/AuditLogSearchCriteriaDTO";
import { validateCreateAuditLogData, validateUpdateAuditLogData } from "../validators/AuditLogValidator";

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
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const log = await this.auditService.getLogById(id);
      res.status(200).json(log);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createLog(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateAuditLogDTO = req.body;

      const validation = validateCreateAuditLogData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const log = await this.auditService.createLog(data);
      res.status(201).json({ success: true, data: log });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateAuditLogDTO = req.body;

      const validation = validateUpdateAuditLogData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const log = await this.auditService.updateLog(id, data);
      res.status(200).json({ success: true, data: log });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.auditService.deleteLog(id);
      res.status(200).json({ success: true, message: "Audit log deleted successfully" });
    } catch (err) {
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async searchLogs(req: Request, res: Response): Promise<void> {
    try {
      const criteria: AuditLogSearchCriteriaDTO = {
        tip_zapisa: req.query.tip_zapisa as any,
        mikroservis: req.query.mikroservis as string | undefined,
        korisnik_id: req.query.korisnik_id ? parseInt(req.query.korisnik_id as string, 10) : undefined,
        datum_od: req.query.datum_od ? new Date(req.query.datum_od as string) : undefined,
        datum_do: req.query.datum_do ? new Date(req.query.datum_do as string) : undefined,
      };

      const logs = await this.auditService.searchLogs(criteria);
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}