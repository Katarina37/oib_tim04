import { Request, Response, Router } from "express";
import { IncidentStatus } from "../../Domain/enums/IncidentStatus";
import { IIncidentService } from "../../Domain/services/IIncidentService";
import {
  parseIncidentId,
  parseIncidentStatus,
  parseLookbackMinutes,
} from "../validators/SecurityIncidentValidator";

export class SecurityIncidentController {
  private readonly router: Router;

  constructor(private readonly incidentService: IIncidentService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/security-incidents", this.getAll.bind(this));
    this.router.get("/security-incidents/open", this.getOpen.bind(this));
    this.router.get("/security-incidents/:id", this.getById.bind(this));
    this.router.patch("/security-incidents/:id/status", this.updateStatus.bind(this));
    this.router.post("/security-incidents/scan", this.runScan.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const incidents = await this.incidentService.getAll();
      res.status(200).json({ success: true, data: incidents });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getOpen(_req: Request, res: Response): Promise<void> {
    try {
      const incidents = await this.incidentService.getByStatus(IncidentStatus.OPEN);
      res.status(200).json({ success: true, data: incidents });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIncidentId(req.params.id);
      const incident = await this.incidentService.getById(id);
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIncidentId(req.params.id);
      const status = parseIncidentStatus(req.body?.status);
      const incident = await this.incidentService.updateStatus(id, status);
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async runScan(req: Request, res: Response): Promise<void> {
    try {
      const lookbackMinutes = parseLookbackMinutes(req.body?.lookbackMinutes);
      const result = await this.incidentService.runScan(lookbackMinutes);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private handleError(res: Response, error: unknown): void {
    const message = error instanceof Error ? error.message : "Unexpected error.";

    if (message.startsWith("VALIDATION:")) {
      res.status(400).json({ success: false, message: message.replace("VALIDATION:", "") });
      return;
    }

    if (message.toLowerCase().includes("not found")) {
      res.status(404).json({ success: false, message });
      return;
    }

    res.status(500).json({ success: false, message });
  }
}
