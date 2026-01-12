import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { StorageController } from "./WebAPI/controllers/StorageController";
import { StorageFacadeService } from "./Services/StorageFacadeService";
import { DistributionCenterStorageService } from "./Services/DistributionCenterStorageService";
import { WarehouseStorageService } from "./Services/WarehouseStorageService";
import { StorageRepository } from "./Services/StorageRepository";
import { LoggerService } from "./Services/LoggerService";
import axios from "axios";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { IStorageRepository } from "./Domain/services/IStorageRepository";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { requireEnv } from "./config/env";

export function createApp(): Application {
    const app: Application = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS Configuration
    const corsConfig = new CorsConfig();
    app.use(cors(corsConfig.buildOptions()));

    // Gateway Auth
    const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
    const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

    // Audit Client
    const auditServiceUrl = requireEnv("GATEWAY_AUDIT_URL");
    const auditHttpClient = axios.create({
        baseURL: auditServiceUrl,
        headers: {
            "Content-Type": "application/json",
            "X-Gateway-Key": gatewayApiKey,
        },
        timeout: 5000,
    });
    const auditClient: IAuditClient = new AxiosAuditClient(auditHttpClient);
    const loggerService = new LoggerService(auditClient, "storage-microservice");

    // Repository
    const storageRepository: IStorageRepository = new StorageRepository();

    // Storage Services
    const distributionCenterService = new DistributionCenterStorageService(storageRepository, loggerService);
    const warehouseStorageService = new WarehouseStorageService(storageRepository, loggerService);

    // Facade
    const storageFacade = new StorageFacadeService(
        distributionCenterService,
        warehouseStorageService
    );

    // Controller
    const storageController = new StorageController(storageFacade, loggerService);

    // Health Check (public endpoint)
    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({ status: "OK", service: "storage-microservice" });
    });

    // Protected Routes (require gateway key)
    const apiRouter = express.Router();
    apiRouter.use(gatewayAuthMiddleware.getHandler());

    if (process.env.ENABLE_REQUEST_AUDIT_LOGS === "true") {
        const requestAuditMiddleware = new RequestAuditMiddleware(loggerService);
        apiRouter.use(requestAuditMiddleware.getHandler());
    }

    apiRouter.use(storageController.getRouter());
    app.use("/api/v1/storage", apiRouter);

    // Error Handling Middleware
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    });

    // 404 Handler
    app.use((_req: Request, res: Response) => {
        res.status(404).json({ message: "Route not found" });
    });

    return app;
}
