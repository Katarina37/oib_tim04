import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { ProcessingController } from "./WebAPI/controllers/ProcessingController";
import { ProcessingService } from "./Services/ProcessingService";
import { ProcessingRepository } from "./Services/ProcessingRepository";
import { LoggerService } from "./Services/LoggerService";
import axios from "axios";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { IProductionClient } from "./Domain/services/IProductionClient";
import { AxiosProductionClient } from "./Infrastructure/clients/AxiosProductionClient";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { getOptionalEnv, requireEnv } from "./config/env";
import { AppDataSource } from "./Database/DbConnectionPool";

export function createApp(): Application {
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const corsConfig = new CorsConfig();
  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);
  app.use(cors(corsConfig.buildOptions()));

  // Dependency Injection
  const processingRepository = new ProcessingRepository(AppDataSource);
  const auditServiceUrl = requireEnv("GATEWAY_AUDIT_URL");
  const productionServiceUrl =
    getOptionalEnv("PRODUCTION_SERVICE_URL") || "http://localhost:5000/api/v1";
  const productionTimeoutRaw = Number.parseInt(
    getOptionalEnv("PRODUCTION_HTTP_TIMEOUT_MS") ?? "30000",
    10
  );
  const productionTimeoutMs =
    Number.isFinite(productionTimeoutRaw) && productionTimeoutRaw > 0
      ? productionTimeoutRaw
      : 30000;

  const normalizeApiBaseUrl = (baseURL: string): string => {
    const trimmed = baseURL.trim().replace(/\/+$/, "");
    if (!trimmed) return trimmed;
    return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
  };

  const auditHttpClient = axios.create({
    baseURL: auditServiceUrl,
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
    timeout: 5000,
  });
  const productionHttpClient = axios.create({
    baseURL: normalizeApiBaseUrl(productionServiceUrl),
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
    timeout: productionTimeoutMs,
  });
  const auditClient: IAuditClient = new AxiosAuditClient(auditHttpClient);
  const productionClient: IProductionClient = new AxiosProductionClient(productionHttpClient);
  const loggerService = new LoggerService(auditClient, "prerada");
  const processingService = new ProcessingService(
    processingRepository,
    loggerService,
    productionClient
  );
  const processingController = new ProcessingController(processingService, loggerService);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "processing-microservice" });
  });

  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());

  if (process.env.ENABLE_REQUEST_AUDIT_LOGS === "true") {
    const requestAuditMiddleware = new RequestAuditMiddleware(loggerService);
    apiRouter.use(requestAuditMiddleware.getHandler());
  }
  apiRouter.use(processingController.getRouter());
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
