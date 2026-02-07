import express, { Application, NextFunction, Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import { ProcessingClientPort } from "./Application/ports/ProcessingClientPort";
import { StorageClientPort } from "./Application/ports/StorageClientPort";
import { PackagingApplicationService } from "./Application/services/PackagingApplicationService";
import { EnsureAvailablePackagesUseCase } from "./Application/usecases/EnsureAvailablePackagesUseCase";
import { GetAvailablePackagesUseCase } from "./Application/usecases/GetAvailablePackagesUseCase";
import { GetPackagingOverviewUseCase } from "./Application/usecases/GetPackagingOverviewUseCase";
import { PackagePerfumesUseCase } from "./Application/usecases/PackagePerfumesUseCase";
import { SendToWarehouseUseCase } from "./Application/usecases/SendToWarehouseUseCase";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { AxiosProcessingClient } from "./Infrastructure/clients/AxiosProcessingClient";
import { AxiosStorageClient } from "./Infrastructure/clients/AxiosStorageClient";
import { NoopStorageClient } from "./Infrastructure/clients/NoopStorageClient";
import { LoggerService } from "./Services/LoggerService";
import { PackagingRepository } from "./Services/PackagingRepository";
import { PackagingController } from "./WebAPI/controllers/PackagingController";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { getOptionalEnv, requireEnv } from "./config/env";

export function createApp(): Application {
  const app: Application = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const corsConfig = new CorsConfig();
  app.use(cors(corsConfig.buildOptions()));

  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

  const normalizeApiBaseUrl = (baseURL: string): string => {
    const trimmed = baseURL.trim().replace(/\/+$/, "");
    if (!trimmed) return trimmed;
    return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
  };

  const processingServiceUrl =
    getOptionalEnv("PROCESSING_BASE_URL") ||
    getOptionalEnv("PROCESSING_SERVICE_URL") ||
    "http://localhost:5001/api/v1";

  const processingClient: ProcessingClientPort = new AxiosProcessingClient(
    normalizeApiBaseUrl(processingServiceUrl),
    gatewayApiKey
  );

  const storageServiceUrl =
    getOptionalEnv("STORAGE_BASE_URL") ||
    getOptionalEnv("STORAGE_SERVICE_URL");
  const storageClient: StorageClientPort = storageServiceUrl
    ? new AxiosStorageClient(normalizeApiBaseUrl(storageServiceUrl), gatewayApiKey)
    : new NoopStorageClient();

  if (!storageServiceUrl) {
    console.warn(
      "[Packaging API] Storage URL not found in env, storage sync is running in NOOP mode."
    );
  }

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
  const loggerService = new LoggerService(auditClient, "pakovanje");
  const packagingRepository = new PackagingRepository();
  const packagePerfumesUseCase = new PackagePerfumesUseCase(
    packagingRepository,
    processingClient,
    storageClient,
    loggerService
  );
  const sendToWarehouseUseCase = new SendToWarehouseUseCase(
    packagingRepository,
    storageClient,
    loggerService
  );
  const ensureAvailablePackagesUseCase = new EnsureAvailablePackagesUseCase(
    packagingRepository,
    packagePerfumesUseCase
  );
  const getAvailablePackagesUseCase = new GetAvailablePackagesUseCase(packagingRepository);
  const getPackagingOverviewUseCase = new GetPackagingOverviewUseCase(packagingRepository);

  const packagingApplicationService = new PackagingApplicationService(
    packagePerfumesUseCase,
    sendToWarehouseUseCase,
    ensureAvailablePackagesUseCase,
    getAvailablePackagesUseCase,
    getPackagingOverviewUseCase
  );

  const packagingController = new PackagingController(
    packagingApplicationService,
    loggerService
  );

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      service: "packaging-microservice",
    });
  });

  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());

  if (process.env.ENABLE_REQUEST_AUDIT_LOGS === "true") {
    const requestAuditMiddleware = new RequestAuditMiddleware(loggerService);
    apiRouter.use(requestAuditMiddleware.getHandler());
  }

  apiRouter.use(packagingController.getRouter());
  app.use("/api/v1", apiRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Interna greska servera" });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta nije pronadjena" });
  });

  return app;
}
