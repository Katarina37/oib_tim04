import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { ProductionController } from "./WebAPI/controllers/ProductionController";
import { PlantsController } from "./WebAPI/controllers/PlantsController";
import { ProductionService } from "./Services/ProductionService";
import { PlantManagementService } from "./Services/PlantManagementService";
import { PlantRepository } from "./Services/PlantRepository";
import { LoggerService } from "./Services/LoggerService";
import axios from "axios";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { requireEnv } from "./config/env";
import { AppDataSource } from "./Database/DbConnectionPool";

export function createApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Configuration
  const corsConfig = new CorsConfig();
  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);
  app.use(cors(corsConfig.buildOptions()));

  // Dependency Injection
  const plantRepository = new PlantRepository(AppDataSource);
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
  const loggerService = new LoggerService(auditClient);
  const productionService = new ProductionService(plantRepository, loggerService);
  const plantManagementService = new PlantManagementService(plantRepository, loggerService);

  // Controllers
  const productionController = new ProductionController(productionService, loggerService);
  const plantsController = new PlantsController(plantManagementService, loggerService);

  // Health Check (public endpoint)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "production-microservice" });
  });

  // Protected Routes (require gateway key)
  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());

  if (process.env.ENABLE_REQUEST_AUDIT_LOGS === "true") {
    const requestAuditMiddleware = new RequestAuditMiddleware(loggerService);
    apiRouter.use(requestAuditMiddleware.getHandler());
  }
  apiRouter.use(productionController.getRouter());
  apiRouter.use(plantsController.getRouter());
  apiRouter.use("/production", plantsController.getRouter()); // allow /production/plants* paths via gateway
  app.use("/api/v1", apiRouter);

  // Error Handling Middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Interna greska servera" });
  });

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta nije pronadjena" });
  });

  return app;
}
