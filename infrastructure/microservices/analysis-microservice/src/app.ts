import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initializeDatabase } from "./Database/InitializeConnection";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { AnalysisRepository } from "./Services/AnalysisRepository";
import { AnalysisService } from "./Services/AnalysisService";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { AnalysisController } from "./WebAPI/controllers/AnalysisController";
import axios from "axios";
import { requireEnv, requireIntEnv } from "./config/env";

export async function createApp(): Promise<express.Application> {

  const app = express();

  // middleware
  app.use(helmet());
  app.use(express.json());

  const corsConfig = new CorsConfig();
  app.use(cors(corsConfig.buildOptions()));

  // audit klijent
  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const auditServiceUrl = requireEnv("GATEWAY_AUDIT_URL");

  const auditHttpClient = axios.create({
    baseURL: auditServiceUrl,
    headers: {
     "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
   timeout: 5000,
  });

  const auditClient = new AxiosAuditClient(auditHttpClient);
  const logger = new LoggerService(auditClient, "analiza-podataka"); //** 

  // gateway autentifikacija
  const gatewayAuth = new GatewayAuthMiddleware(requireEnv("GATEWAY_API_KEY"));
  app.use(gatewayAuth.getHandler());

  //request audit
  const requestAudit = new RequestAuditMiddleware(logger);
  app.use(requestAudit.getHandler());

  //inicijalizacija servisa
  const analysisRepository = new AnalysisRepository();
  const analysisService = new AnalysisService(analysisRepository, logger);
  const analysisController = new AnalysisController(analysisService, logger);

  app.use("/api/analysis", analysisController.getRouter());
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK", service: "analysis-microservice" });
  });
   app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
  app.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Unhandled error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  );


  return app;
}
