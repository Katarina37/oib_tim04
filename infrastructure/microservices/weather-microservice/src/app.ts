import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import { WeatherController } from "./WebAPI/controllers/WeatherController";
import { WeatherService } from "./Services/WeatherService";
import { WeatherRepository } from "./Services/WeatherRepository";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { AxiosProductionClient } from "./Infrastructure/clients/AxiosProductionClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { IProductionClient } from "./Domain/services/IProductionClient";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { requireEnv } from "./config/env";

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
  const weatherRepository = new WeatherRepository();

  // Audit client setup
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

  // Production client setup (for weather effects)
  const productionServiceUrl = requireEnv("PRODUCTION_SERVICE_URL");
  const productionHttpClient = axios.create({
    baseURL: productionServiceUrl,
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
    timeout: 10000,
  });
  const productionClient: IProductionClient = new AxiosProductionClient(productionHttpClient);

  // Services
  const weatherService = new WeatherService(weatherRepository, loggerService, productionClient);

  // Controllers
  const weatherController = new WeatherController(weatherService, loggerService);

  // Health Check (public endpoint)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "weather-microservice" });
  });

  // Protected Routes (require gateway key)
  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());
  apiRouter.use(weatherController.getRouter());
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
