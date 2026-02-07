import { Router, Request, Response } from "express";
import { IProcessingService } from "../../Domain/services/IProcessingService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { StartProcessingDTO } from "../../Domain/DTOs/StartProcessingDTO";
import { RequestPerfumesDTO } from "../../Domain/DTOs/RequestPerfumesDTO";
import { PerfumeSearchCriteriaDTO } from "../../Domain/DTOs/PerfumeSearchCriteriaDTO";
import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { LogLevel } from "../../Domain/enums/LogLevel";
import {
  validateStartProcessingData,
  validateRequestPerfumesData,
  parseBottleVolumeFromQuery,
} from "../validators/ProcessingValidator";

export class ProcessingController {
  private readonly router: Router;

  constructor(
    private readonly processingService: IProcessingService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/processing/start", this.startProcessing.bind(this));
    this.router.post("/processing/request-perfumes", this.requestPerfumes.bind(this));
    this.router.get("/processing/perfumes", this.getPerfumes.bind(this));
    this.router.get("/processing/stats", this.getStats.bind(this));
  }

  getRouter(): Router {
    return this.router;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private async startProcessing(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const data: StartProcessingDTO = req.body;
      const validation = validateStartProcessingData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.processingService.startProcessing(data);

      await this.logger.log(
        `Uspesno pokrenuta prerada za ${data.perfumeName}`,
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            perfumeName: data.perfumeName,
            bottleQuantity: data.bottleQuantity,
            requiredPlants: result.requiredPlants,
          },
        }
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri pokretanju prerade: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  private async requestPerfumes(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const data: RequestPerfumesDTO = req.body;
      const validation = validateRequestPerfumesData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.processingService.requestPerfumes(data);

      await this.logger.log(
        `Uspesno preuzeti parfemi za pakovanje`,
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            requestedQuantity: data.quantity,
            returnedQuantity: result.returnedQuantity,
          },
        }
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju parfema za pakovanje: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  private async getPerfumes(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const rawType = req.query.perfumeType as string | undefined;
      const sortBy = req.query.sortBy as PerfumeSearchCriteriaDTO["sortBy"] | undefined;
      const sortDirection = req.query.sortDirection as PerfumeSearchCriteriaDTO["sortDirection"] | undefined;

      const criteria: PerfumeSearchCriteriaDTO = {
        perfumeName: (req.query.perfumeName as string) || undefined,
        perfumeType:
          rawType && Object.values(PerfumeType).includes(rawType as PerfumeType)
            ? (rawType as PerfumeType)
            : undefined,
        bottleVolumeMl: parseBottleVolumeFromQuery(req.query.bottleVolumeMl),
        onlyAvailableForPackaging: req.query.onlyAvailableForPackaging === "true",
        sortBy,
        sortDirection: sortDirection === "ASC" ? "ASC" : "DESC",
      };

      const perfumes = await this.processingService.getPerfumes(criteria);
      await this.logger.log(
        `Uspesno preuzet pregled parfema (${perfumes.length})`,
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            criteria,
            resultCount: perfumes.length,
          },
        }
      );
      res.status(200).json(perfumes);
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju parfema: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async getStats(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const stats = await this.processingService.getStats();
      await this.logger.log(
        "Uspesno preuzeta statistika prerade",
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: stats,
        }
      );
      res.status(200).json(stats);
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju statistike prerade: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
