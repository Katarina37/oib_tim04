import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import { CorsConfig } from "./WebApi/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebApi/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebApi/middleware/RequestAuditMiddleware";
import { TypeOrmPerformanceRepository } from "./Infrastructure/repositories/TypeOrmPerformanceRepository";
import { PerformanceApplicationService } from "./Application/services/PerformanceApplicationService";
import { RunSimulationUseCase } from "./Application/usecases/RunSimulationUseCase";
import { GetPerformanceReportsUseCase } from "./Application/usecases/GetPerformanceReportsUseCase";
import { GetPerformanceReportByIdUseCase } from "./Application/usecases/GetPerformanceReportByIdUseCase";
import { ExportPerformanceReportPdfUseCase } from "./Application/usecases/ExportPerformanceReportPdfUseCase";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { PerformanceController } from "./WebApi/controllers/PerformanceController";
import { getOptionalEnv, requireEnv } from "./config/env";
import { DeterministicSimulationEngine } from "./Infrastructure/services/DeterministicSimulationEngine";
import { PdfGenerator } from "./Infrastructure/services/PdfGenerator";

export function createApp(): express.Application {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  const corsConfig = new CorsConfig();
  app.use(cors(corsConfig.buildOptions()));

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
  const logger = new LoggerService(auditClient, "performance-microservice");

  const performanceRepository = new TypeOrmPerformanceRepository();
  const simulationEngine = new DeterministicSimulationEngine();
  const pdfGenerator = new PdfGenerator();

  const runSimulationUseCase = new RunSimulationUseCase(performanceRepository, simulationEngine);
  const getPerformanceReportsUseCase = new GetPerformanceReportsUseCase(performanceRepository);
  const getPerformanceReportByIdUseCase = new GetPerformanceReportByIdUseCase(
    performanceRepository
  );
  const exportPerformanceReportPdfUseCase = new ExportPerformanceReportPdfUseCase(
    getPerformanceReportByIdUseCase,
    pdfGenerator
  );

  const performanceApplicationService = new PerformanceApplicationService(
    runSimulationUseCase,
    getPerformanceReportsUseCase,
    getPerformanceReportByIdUseCase,
    exportPerformanceReportPdfUseCase
  );

  const performanceController = new PerformanceController(performanceApplicationService, logger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK", service: "performance-microservice" });
  });

  const apiRouter = express.Router();
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);
  apiRouter.use(gatewayAuthMiddleware.getHandler());

  if (getOptionalEnv("ENABLE_REQUEST_AUDIT_LOGS") === "true") {
    const requestAuditMiddleware = new RequestAuditMiddleware(logger);
    apiRouter.use(requestAuditMiddleware.getHandler());
  }

  apiRouter.use(performanceController.getRouter());
  app.use("/api/v1", apiRouter);

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  });

  app.use((_req, res) => {
    res.status(404).json({ message: "Ruta nije pronadjena" });
  });

  return app;
}
