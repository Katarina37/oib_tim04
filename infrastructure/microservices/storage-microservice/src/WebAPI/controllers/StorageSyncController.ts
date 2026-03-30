import { Request, Response, Router } from "express";
import { PackagingSyncDTO } from "../../Domain/DTOs/PackagingSyncDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { INotificationClient } from "../../Domain/services/INotificationClient";
import { IStorageSyncService } from "../../Domain/services/IStorageSyncService";
import { validatePackagingSyncData } from "../validators/PackageValidator";

export class StorageSyncController {
  private readonly router: Router;

  constructor(
    private readonly storageSyncService: IStorageSyncService,
    private readonly logger: ILoggerService,
    private readonly notificationClient: INotificationClient
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/storage/internal/packaging-sync", this.syncPackaging.bind(this));
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

  private async syncPackaging(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const payload = (req.body ?? {}) as PackagingSyncDTO;
      const validation = validatePackagingSyncData(payload);

      if (!validation.success) {
        await this.logger.log(
          `Validacija interne sinhronizacije pakovanja nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          {
            ipAddress: clientIp,
            additionalData: payload as unknown as Record<string, unknown>,
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.storageSyncService.syncPackagingPackages(payload);
      const level = result.missingPackages === 0 ? LogLevel.INFO : LogLevel.WARNING;

      await this.logger.log("Sinhronizacija pakovanja sa skladistem je zavrsena", level, {
        ipAddress: clientIp,
        additionalData: {
          operation: result.operation,
          requestedPackages: payload.packageIds.length,
          recordedPackages: result.recordedPackages,
          missingPackages: result.missingPackages,
          targetWarehouseId: payload.targetWarehouseId,
        },
      });

      if (result.missingPackages > 0) {
        await this.trySendNotificationEvent({
          eventType: "STORAGE_PACKAGING_SYNC_PARTIAL",
          sourceService: "storage-microservice",
          title: "Delimicna sinhronizacija pakovanja i skladista",
          message: `Nedostaje ${result.missingPackages} paketa tokom sinhronizacije.`,
          priority: "WARNING",
          targetRole: "SALES_MANAGER",
          metadata: {
            operation: result.operation,
            requestedPackages: payload.packageIds.length,
            recordedPackages: result.recordedPackages,
            missingPackages: result.missingPackages,
            targetWarehouseId: payload.targetWarehouseId,
          },
        });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logger.log(
        `Greska pri internoj sinhronizaciji pakovanja: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          ipAddress: clientIp,
        }
      );
      await this.trySendNotificationEvent({
        eventType: "STORAGE_PACKAGING_SYNC_ERROR",
        sourceService: "storage-microservice",
        title: "Greska pri sinhronizaciji pakovanja i skladista",
        message: `Sinhronizacija nije uspela: ${(error as Error).message}`,
        priority: "ERROR",
        targetRole: "ADMIN",
      });
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async trySendNotificationEvent(payload: {
    eventType: string;
    sourceService: string;
    title: string;
    message: string;
    priority: "INFO" | "WARNING" | "ERROR";
    targetRole?: "ADMIN" | "SALES_MANAGER" | "SELLER";
    targetUserId?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.notificationClient.sendEvent(payload);
    } catch (notificationError) {
      console.error(
        "Notification event delivery failed:",
        (notificationError as Error).message,
        payload
      );
    }
  }
}
