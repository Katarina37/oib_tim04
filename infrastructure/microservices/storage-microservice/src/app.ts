import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";

import { StorageController } from "./WebAPI/controllers/StorageController";
import { StorageOverviewController } from "./WebAPI/controllers/StorageOverviewController";
import { StorageSyncController } from "./WebAPI/controllers/StorageSyncController";

import { StorageFacadeService } from "./Services/StorageFacadeService";
import { DistributionCenterStorageService } from "./Services/DistributionCenterStorageService";
import { WarehouseStorageService } from "./Services/WarehouseStorageService";
import { StorageOverviewService } from "./Services/StorageOverviewService";
import { StorageSyncService } from "./Services/StorageSyncService";

import { StorageRepository } from "./Services/StorageRepository";
import { LoggerService } from "./Services/LoggerService";
import { AxiosPackagingClient } from "./Infrastructure/clients/AxiosPackagingClient";

import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { IPackagingClient } from "./Domain/services/IPackagingClient";
import { IStorageRepository } from "./Domain/services/IStorageRepository";
import { IStorageSyncService } from "./Domain/services/IStorageSyncService";

import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { getOptionalEnv, requireEnv } from "./config/env";

export function createApp(): Application {
    const app: Application = express();


    // Middleware

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const corsConfig = new CorsConfig();
    const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
    const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);
    app.use(cors(corsConfig.buildOptions()));

    const normalizeApiBaseUrl = (baseURL: string): string => {
        const trimmed = baseURL.trim().replace(/\/+$/, "");
        if (!trimmed) return trimmed;
        return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
    };

    const packagingServiceUrl =
        getOptionalEnv("PACKAGING_BASE_URL") ||
        getOptionalEnv("PACKAGING_SERVICE_URL") ||
        "http://localhost:5008/api/v1";
    const packagingClient: IPackagingClient = new AxiosPackagingClient(
        normalizeApiBaseUrl(packagingServiceUrl),
        gatewayApiKey
    );

    // Dependency Injection
   
    // Repository
    const storageRepository: IStorageRepository = new StorageRepository();

    // Audit + Logger
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

    // WRITE services
    const distributionCenterService =
        new DistributionCenterStorageService(storageRepository, packagingClient, loggerService);

    const warehouseStorageService =
        new WarehouseStorageService(storageRepository, packagingClient, loggerService);

    // WRITE facade
    const storageFacade = new StorageFacadeService(
        distributionCenterService,
        warehouseStorageService
    );

    // READ service
    const storageOverviewService =
        new StorageOverviewService(storageRepository);
    const storageSyncService: IStorageSyncService =
        new StorageSyncService(storageRepository);

    // Controllers

    const storageController =
        new StorageController(storageFacade, loggerService);

    const storageOverviewController =
        new StorageOverviewController(storageOverviewService, loggerService);
    const storageSyncController =
        new StorageSyncController(storageSyncService, loggerService);

    // Health check

    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({
            status: "OK",
            service: "storage-microservice",
        });
    });

    // Protected routes

    const apiRouter = express.Router();
    apiRouter.use(gatewayAuthMiddleware.getHandler());

    if (process.env.ENABLE_REQUEST_AUDIT_LOGS === "true") {
        const requestAuditMiddleware =
            new RequestAuditMiddleware(loggerService);
        apiRouter.use(requestAuditMiddleware.getHandler());
    }

    apiRouter.use(storageController.getRouter());
    apiRouter.use(storageOverviewController.getRouter());
    apiRouter.use(storageSyncController.getRouter());

    app.use("/api/v1", apiRouter);

    // Error handling

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Error:", err.message);
        res.status(500).json({ message: "Interna greska servera" });
    });

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ message: "Ruta nije pronadjena" });
    });

    return app;
}
