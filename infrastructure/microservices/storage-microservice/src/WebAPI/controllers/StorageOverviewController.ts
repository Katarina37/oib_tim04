import { Router, Request, Response } from "express";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { IStorageOverviewService } from "../../Domain/services/IStorageOverviewService";

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

    private async getAvailablePackages(_req: Request, res: Response): Promise<void> {
        try {
            const available = await this.overviewService.getAvailablePackages();
            res.status(200).json(available);
        } catch (error) {
            console.error("Error in getOverview:", error);
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    private async getOverview(_req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await this.overviewService.getWarehouses();
            const packages = await this.overviewService.getPackages();
            res.status(200).json({ warehouses, packages });
        } catch (error) {
            console.error("Error in getOverview:", error); 
            res.status(500).json({ success: false, message: "Internal Server Error", error: error });
        }
    }
}