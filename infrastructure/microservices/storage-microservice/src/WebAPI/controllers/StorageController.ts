import { Router, Request, Response } from "express";
import { StorageFacadeService } from "../../Services/StorageFacadeService";
import { IStorageService } from "../../Domain/services/IStorageService";
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

    private async sendPackage(req: Request, res: Response): Promise<void> {
        const clientIp = this.getClientIp(req);

        try {
            const roleHeader = req.headers["x-user-role"];
            const userIdHeader = req.headers["x-user-id"];

            console.log("BODY:", req.body);
            console.log("ROLE HEADER:", roleHeader);
            console.log("USER ID HEADER:", userIdHeader);

            if (!roleHeader || !userIdHeader) {
                console.log("User context missing");
                res.status(401).json({ success: false, message: "User context missing" });
                return;
            }

            const roleStr = roleHeader.toString().trim().toLowerCase();
            console.log("Normalized role:", roleStr);

            if (!Object.values(UserRole).includes(roleStr as UserRole)) {
                console.log("Role not in enum:", roleStr);
                res.status(403).json({ success: false, message: "Nedozvoljena uloga" });
                return;
            }

            const role = roleStr as UserRole;
            const userId = userIdHeader.toString();

            console.log("Mapped role to enum:", role);

            const storageService: IStorageService = this.storageFacade.getStorageService(role);
            console.log("Storage service instance:", storageService.constructor.name);

            const data: SendPackageDTO = req.body;
            const validation = validateSendPackageData(data);

            if (!validation.success) {
                console.log("Validation failed:", validation.message);
                await this.logger.log(
                    `Validacija nije uspela: ${validation.message}`,
                    LogLevel.WARNING,
                    { ipAddress: clientIp, additionalData: { data, userId, role } }
                );
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const sentPackages = await storageService.sendPackages(data.quantity);
            console.log("Sent packages:", sentPackages);

            await this.logger.log(
                `Uspesno poslato ${sentPackages} ambalaza (${role}, userId: ${userId})`,
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    additionalData: { requestedQuantity: data.quantity, sentPackages, userId },
                }
            );

            res.status(200).json({ success: true, data: { sentPackages } });
        } catch (error) {
            console.log("SEND PACKAGE ERROR:", error);
            await this.logger.log(
                `Greska pri slanju ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                { ipAddress: clientIp }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }


}
