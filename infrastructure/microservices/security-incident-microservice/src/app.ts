import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import { SecurityIncidentController } from "./WebAPI/controllers/SecurityIncidentController";
import { IncidentService } from "./Services/IncidentService";
import { IncidentRepository } from "./Services/IncidentRepository";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { AxiosAuditSearchClient } from "./Infrastructure/clients/AxiosAuditSearchClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { IAuditSearchClient } from "./Domain/services/IAuditSearchClient";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { getOptionalEnv, requireEnv } from "./config/env";

const readPositiveInt = (key: string, fallback: number): number => {
  const raw = getOptionalEnv(key);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function createApp(): Application {
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const corsConfig = new CorsConfig();
  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);
  app.use(cors(corsConfig.buildOptions()));

  const incidentRepository = new IncidentRepository();

  const auditServiceUrl = requireEnv("GATEWAY_AUDIT_URL");
  const auditHttpClient = axios.create({
    baseURL: auditServiceUrl,
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
    timeout: 7000,
  });

  const auditClient: IAuditClient = new AxiosAuditClient(auditHttpClient);
  const auditSearchClient: IAuditSearchClient = new AxiosAuditSearchClient(auditHttpClient);
  const loggerService = new LoggerService(auditClient);

  const incidentService = new IncidentService(
    incidentRepository,
    loggerService,
    auditSearchClient,
    {
      defaultLookbackMinutes: readPositiveInt("INCIDENT_DEFAULT_LOOKBACK_MINUTES", 30),
      bruteForceThreshold: readPositiveInt("INCIDENT_BRUTE_FORCE_THRESHOLD", 5),
      unauthorizedThreshold: readPositiveInt("INCIDENT_UNAUTHORIZED_THRESHOLD", 3),
      errorSpikeThreshold: readPositiveInt("INCIDENT_ERROR_SPIKE_THRESHOLD", 6),
    }
  );

  const autoScanEnabled = (getOptionalEnv("INCIDENT_AUTO_SCAN_ENABLED") ?? "true") !== "false";
  const scanIntervalSeconds = readPositiveInt("INCIDENT_SCAN_INTERVAL_SECONDS", 120);

  if (autoScanEnabled) {
    setInterval(() => {
      void incidentService.runScan().catch((error) => {
        console.error("[SecurityIncidentService] Background scan failed:", error);
      });
    }, scanIntervalSeconds * 1000);
  }

  const incidentController = new SecurityIncidentController(incidentService);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "security-incident-microservice" });
  });

  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());
  apiRouter.use(incidentController.getRouter());
  app.use("/api/v1", apiRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
}
