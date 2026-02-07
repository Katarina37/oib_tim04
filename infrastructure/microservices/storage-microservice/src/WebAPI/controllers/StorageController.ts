import { Router, Request, Response } from "express";
import { StorageFacadeService } from "../../Services/StorageFacadeService";
import { IStorageService } from "../../Domain/services/IStorageService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { SendPackageDTO } from "../../Domain/DTOs/SendPackageDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { UserRole } from "../../Domain/enums/UserRole";
import { validatePackageIds, validateSendPackageData } from "../validators/PackageValidator";

interface ResolvedUserContext {
    role: UserRole;
    userId: string;
    storageService: IStorageService;
}

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
        this.router.post("/storage/reserve-package", this.reservePackage.bind(this));
        this.router.post("/storage/send-reserved", this.sendReservedPackages.bind(this));
        this.router.post("/storage/unpack-package", this.unpackPackage.bind(this));
        this.router.post("/storage/release-package", this.releasePackage.bind(this));
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
            const context = await this.resolveUserContext(req, res, clientIp);
            if (!context) {
                return;
            }
            const { role, userId, storageService } = context;

            const data: SendPackageDTO = req.body;
            const validation = validateSendPackageData(data);

            if (!validation.success) {
                await this.logger.log(
                    `Validacija nije uspela: ${validation.message}`,
                    LogLevel.WARNING,
                    { ipAddress: clientIp, additionalData: { data, userId, role } }
                );
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const sentPackages = await storageService.sendPackages(data.quantity);

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
            await this.logger.log(
                `Greska pri slanju ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                { ipAddress: clientIp }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async reservePackage(req: Request, res: Response): Promise<void> {
        const clientIp = this.getClientIp(req);

        try {
            const context = await this.resolveUserContext(req, res, clientIp);
            if (!context) {
                return;
            }
            const { role, userId, storageService } = context;

            const data: SendPackageDTO = req.body;
            const validation = validateSendPackageData(data);

            if (!validation.success) {
                await this.logger.log(
                    `Validacija nije uspela: ${validation.message}`,
                    LogLevel.WARNING,
                    { ipAddress: clientIp, additionalData: { data, userId, role } }
                );
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const packageIds = await storageService.reservePackages(data.quantity);
            await this.logger.log(
                `Rezervisano ${packageIds.length} ambalaza (${role}, userId: ${userId})`,
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    additionalData: {
                        requestedQuantity: data.quantity,
                        reservedPackages: packageIds.length,
                        packageIds,
                        userId,
                    },
                }
            );

            res.status(200).json({ success: true, data: { packageIds } });
        } catch (error) {
            await this.logger.log(
                `Greska pri rezervaciji ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                { ipAddress: clientIp }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async sendReservedPackages(req: Request, res: Response): Promise<void> {
        await this.handlePackageIdAction(
            req,
            res,
            "slanju rezervisane ambalaze",
            async (storageService, packageIds) => storageService.sendReservedPackages(packageIds),
            "sentPackages"
        );
    }

    private async unpackPackage(req: Request, res: Response): Promise<void> {
        await this.handlePackageIdAction(
            req,
            res,
            "raspakivanju ambalaze",
            async (storageService, packageIds) => storageService.unpackPackages(packageIds),
            "unpackedPackages"
        );
    }

    private async releasePackage(req: Request, res: Response): Promise<void> {
        await this.handlePackageIdAction(
            req,
            res,
            "vracanju ambalaze",
            async (storageService, packageIds) => storageService.releasePackages(packageIds),
            "releasedPackages"
        );
    }

    private async handlePackageIdAction(
        req: Request,
        res: Response,
        actionDescription: string,
        action: (storageService: IStorageService, packageIds: number[]) => Promise<number>,
        responseField: "sentPackages" | "unpackedPackages" | "releasedPackages"
    ): Promise<void> {
        const clientIp = this.getClientIp(req);

        try {
            const context = await this.resolveUserContext(req, res, clientIp);
            if (!context) {
                return;
            }
            const { role, userId, storageService } = context;
            const packageIds = req.body?.packageIds;
            const validation = validatePackageIds(packageIds);

            if (!validation.success) {
                await this.logger.log(
                    `Validacija nije uspela: ${validation.message}`,
                    LogLevel.WARNING,
                    {
                        ipAddress: clientIp,
                        additionalData: { packageIds, userId, role, action: actionDescription },
                    }
                );
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const affectedPackages = await action(storageService, packageIds as number[]);
            await this.logger.log(
                `Uspesno obradjeno ${affectedPackages}/${(packageIds as number[]).length} ambalaza pri ${actionDescription} (${role}, userId: ${userId})`,
                LogLevel.INFO,
                {
                    ipAddress: clientIp,
                    additionalData: {
                        packageIds,
                        affectedPackages,
                        action: actionDescription,
                        userId,
                    },
                }
            );

            res.status(200).json({
                success: true,
                data: { [responseField]: affectedPackages },
            });
        } catch (error) {
            await this.logger.log(
                `Greska pri ${actionDescription}: ${(error as Error).message}`,
                LogLevel.ERROR,
                { ipAddress: clientIp }
            );
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async resolveUserContext(
        req: Request,
        res: Response,
        clientIp: string
    ): Promise<ResolvedUserContext | null> {
        const roleHeader = req.headers["x-user-role"];
        const userIdHeader = req.headers["x-user-id"];

        if (!roleHeader || !userIdHeader) {
            await this.logger.log(
                "Odbijen zahtev za skladiste: nedostaje korisnicki kontekst",
                LogLevel.WARNING,
                {
                    ipAddress: clientIp,
                    additionalData: {
                        hasRoleHeader: Boolean(roleHeader),
                        hasUserIdHeader: Boolean(userIdHeader),
                    },
                }
            );
            res.status(401).json({ success: false, message: "User context missing" });
            return null;
        }

        const roleStr = roleHeader.toString().trim().toLowerCase();
        if (!Object.values(UserRole).includes(roleStr as UserRole)) {
            await this.logger.log(
                `Odbijen zahtev za skladiste: nedozvoljena uloga (${roleStr})`,
                LogLevel.WARNING,
                {
                    ipAddress: clientIp,
                    additionalData: { role: roleStr, userId: userIdHeader.toString() },
                }
            );
            res.status(403).json({ success: false, message: "Nedozvoljena uloga" });
            return null;
        }

        const role = roleStr as UserRole;
        const userId = userIdHeader.toString();
        let storageService: IStorageService;

        try {
            storageService = this.storageFacade.getStorageService(role);
        } catch (error) {
            await this.logger.log(
                `Odbijen zahtev za skladiste: ${(error as Error).message}`,
                LogLevel.ERROR,
                {
                    ipAddress: clientIp,
                    additionalData: { role, userId },
                }
            );
            res.status(403).json({ success: false, message: "Nedozvoljena uloga" });
            return null;
        }

        return { role, userId, storageService };
    }
}
