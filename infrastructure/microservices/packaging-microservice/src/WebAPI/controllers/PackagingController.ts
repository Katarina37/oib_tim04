import { IPackagingApplicationService } from "../../Application/services/IPackagingApplicationService";
import { Request, Response, Router } from "express";
import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import {
  validatePackagePerfumesData,
  validateSendToWarehouseData,
  validateQuantityPayload,
} from "../validators/PackagingValidator";

export class PackagingController {
  private readonly router: Router;

  constructor(
    private readonly packagingApplicationService: IPackagingApplicationService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/packaging/package-perfumes", this.packagePerfumes.bind(this));
    this.router.post("/packaging/send-to-warehouse", this.sendToWarehouse.bind(this));
    this.router.post("/packaging/ensure-available", this.ensureAvailablePackages.bind(this));
    this.router.get("/packaging/available", this.getAvailablePackages.bind(this));
    this.router.get("/packaging/overview", this.getOverview.bind(this));
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

  private resolveUserContext(req: Request): { userId?: string; role?: string } {
    return {
      userId: req.headers["x-user-id"]?.toString(),
      role: req.headers["x-user-role"]?.toString(),
    };
  }

  private async packagePerfumes(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const context = this.resolveUserContext(req);

    try {
      const data: PackagePerfumesDTO = req.body;
      const validation = validatePackagePerfumesData(data);
      if (!validation.success) {
        await this.logger.log(
          `Validacija pakovanja nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          {
            ipAddress: clientIp,
            additionalData: {
              userId: context.userId,
              role: context.role,
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.packagingApplicationService.packagePerfumes(data);
      await this.logger.log(
        `Uspesno pakovanje parfema: ${result.packagedQuantity}/${result.requestedQuantity}`,
        result.missingQuantity === 0 ? LogLevel.INFO : LogLevel.WARNING,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
            ...result,
          },
        }
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri pakovanju parfema: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
          },
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async ensureAvailablePackages(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const context = this.resolveUserContext(req);

    try {
      const validation = validateQuantityPayload(req.body ?? {});
      if (!validation.success) {
        await this.logger.log(
          `Validacija dopune ambalaze nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          {
            ipAddress: clientIp,
            additionalData: {
              userId: context.userId,
              role: context.role,
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.packagingApplicationService.ensureAvailablePackages(req.body.quantity);
      await this.logger.log(
        `Obezbedjeno dostupnih ambalaza: ${result.availableAfter}`,
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
            ...result,
          },
        }
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri dopuni dostupne ambalaze: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
          },
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async sendToWarehouse(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const context = this.resolveUserContext(req);

    try {
      const data: SendToWarehouseDTO = (req.body ?? {}) as SendToWarehouseDTO;
      const validation = validateSendToWarehouseData(data);
      if (!validation.success) {
        await this.logger.log(
          `Validacija slanja u skladiste nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          {
            ipAddress: clientIp,
            additionalData: {
              userId: context.userId,
              role: context.role,
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.packagingApplicationService.sendToWarehouse(data);
      await this.logger.log(
        `Uspesno slanje paketa u skladiste: ${result.movedPackages}/${result.requestedPackages}`,
        result.missingPackages === 0 ? LogLevel.INFO : LogLevel.WARNING,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
            ...result,
          },
        }
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri slanju paketa u skladiste: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
          },
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async getAvailablePackages(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const context = this.resolveUserContext(req);

    try {
      const result = await this.packagingApplicationService.getAvailablePackages();
      await this.logger.log(
        "Uspesno preuzeto stanje dostupnih ambalaza za pakovanje",
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
            ...result,
          },
        }
      );

      res.status(200).json(result);
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju dostupnih ambalaza: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
          },
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async getOverview(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const context = this.resolveUserContext(req);

    try {
      const result = await this.packagingApplicationService.getOverview();
      await this.logger.log(
        "Uspesno preuzet pregled pakovanja",
        LogLevel.INFO,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
            warehouseCount: result.warehouses.length,
            packageCount: result.packages.length,
          },
        }
      );

      res.status(200).json(result);
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju pregleda pakovanja: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
          additionalData: {
            userId: context.userId,
            role: context.role,
          },
        }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
