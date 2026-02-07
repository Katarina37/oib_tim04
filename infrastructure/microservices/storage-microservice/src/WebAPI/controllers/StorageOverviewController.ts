import { Router, Request, Response } from "express";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { IStorageOverviewService } from "../../Domain/services/IStorageOverviewService";
import { LogLevel } from "../../Domain/enums/LogLevel";

export class StorageOverviewController {
    private readonly router: Router;

    constructor(
        private readonly overviewService: IStorageOverviewService,
        private readonly logger: ILoggerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/storage/available", this.getAvailablePackages.bind(this));
        this.router.get("/storage/overview", this.getOverview.bind(this));
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

    private resolveUserContext(req: Request): { userId?: number; role?: string; rawUserId?: string } {
        const rawUserId = req.headers["x-user-id"]?.toString();
        const userIdCandidate = Number(rawUserId);
        const userId = Number.isFinite(userIdCandidate) && userIdCandidate > 0
            ? userIdCandidate
            : undefined;
        const role = req.headers["x-user-role"]?.toString();

        return { userId, role, rawUserId };
    }

    private async getAvailablePackages(req: Request, res: Response): Promise<void> {
        const clientIp = this.getClientIp(req);
        const { userId, role, rawUserId } = this.resolveUserContext(req);

        try {
            const available = await this.overviewService.getAvailablePackages();

            await this.logger.log(
                "Uspesno preuzeto stanje dostupne ambalaze",
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    userId,
                    additionalData: {
                        role,
                        rawUserId,
                        distributiveCenter: available.distributiveCenter,
                        warehouseCenter: available.warehouseCenter,
                    },
                }
            );

            res.status(200).json(available);
        } catch (error) {
            await this.logger.log(
                `Greska pri preuzimanju stanja dostupne ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                {
                    ipAddress: clientIp,
                    userId,
                    additionalData: { role, rawUserId },
                }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async getOverview(req: Request, res: Response): Promise<void> {
        const clientIp = this.getClientIp(req);
        const { userId, role, rawUserId } = this.resolveUserContext(req);

        try {
            const [warehouses, packages] = await Promise.all([
                this.overviewService.getWarehouses(),
                this.overviewService.getPackages(),
            ]);

            await this.logger.log(
                "Uspesno preuzet pregled skladista i ambalaza",
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    userId,
                    additionalData: {
                        role,
                        rawUserId,
                        warehouseCount: warehouses.length,
                        packageCount: packages.length,
                    },
                }
            );

            res.status(200).json({ warehouses, packages });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Nepoznata greska";
            await this.logger.log(
                `Greska pri preuzimanju pregleda skladista: ${message}`,
                LogLevel.ERROR,
                {
                    ipAddress: clientIp,
                    userId,
                    additionalData: { role, rawUserId },
                }
            );
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}
