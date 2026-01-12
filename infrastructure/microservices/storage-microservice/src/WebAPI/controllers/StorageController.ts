import { Router, Request, Response } from "express";
import { StorageFacadeService } from "../../Services/StorageFacadeService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { SendPackageDTO } from "../../Domain/DTOs/SendPackageDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { UserRole } from "../../Domain/enums/UserRole";
import { validateSendPackageData } from "../validators/PackageValidator";

export class StorageController {
    private readonly router: Router;

    constructor(
        private readonly storageFacade: StorageFacadeService,
        private readonly logger: ILoggerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/storage/send-package", this.sendPackage.bind(this));
        this.router.get("/storage/available", this.getAvailablePackages.bind(this));
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

    private getUserRole(req: Request): UserRole {
        const role = (req as any).user?.role;
        if (role === UserRole.MANAGER || role === UserRole.SELLER) return role;
        throw new Error("Nedozvoljena uloga za pristup skladistu");
    }

    private async sendPackage(req: Request, res: Response): Promise<void> {
        const clientIp = this.getClientIp(req);

        try {
            const role = this.getUserRole(req);
            const storageService = this.storageFacade.getStorageService(role);

            const data: SendPackageDTO = req.body;
            const validation = validateSendPackageData(data);

            if (!validation.success) {
                await this.logger.log(
                    `Validacija nije uspela: ${validation.message}`,
                    LogLevel.WARNING,
                    { ipAddress: clientIp, additionalData: { data } }
                );
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const sentPackages = await storageService.sendPackages(data.quantity);

            await this.logger.log(
                `Uspesno poslato ${sentPackages} ambalaza (${role})`,
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    additionalData: { requestedQuantity: data.quantity, sentPackages },
                }
            );

            res.status(200).json({ success: true, data: { sentPackages } });
        } catch (error) {
            await this.logger.log(
                `Greska pri slanju ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                { ipAddress: clientIp }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async getAvailablePackages(_req: Request, res: Response): Promise<void> {
        try {
            const distributiveAvailable = await this.storageFacade
                .getStorageService(UserRole.MANAGER)
                .getAvailablePackages();

            const warehouseAvailable = await this.storageFacade
                .getStorageService(UserRole.SELLER)
                .getAvailablePackages();

            res.status(200).json({
                distributiveCenter: distributiveAvailable,
                warehouseCenter: warehouseAvailable,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
}
