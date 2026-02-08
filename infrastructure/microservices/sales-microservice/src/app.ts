import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";

import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";

import { getOptionalEnv, requireEnv } from "./config/env";

import { SalesController } from "./WebAPI/controllers/SaleController";
import { SaleService } from "./Services/SaleService";
import { TypeORMSaleRepository } from "./Infrastructure/repositories/TypeORMSaleRepository";

import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { AnalysisClient } from "./Infrastructure/clients/AnalysisClient";
import { StorageClient } from "./Infrastructure/clients/StorageClient";
import { DatabasePerfumeCatalogClient } from "./Infrastructure/clients/DatabasePerfumeCatalogClient";

import { IAuditClient } from "./Domain/services/IAuditClient";
import { IAnalysisClient } from "./Domain/services/IAnalysisClient";
import { IStorageClient } from "./Domain/services/IStorageClient";
import { IPerfumeCatalogClient } from "./Domain/services/IPerfumeCatalogClient";
import { ILoggerService } from "./Domain/services/ILoggerService";

import { LoggerService } from "./Services/LoggerService";
import { Db } from "./DataBase/DbConnectionPool";
import { createProxyMiddleware } from "http-proxy-middleware/dist/factory";

export async function createApp(): Promise<Application> {
  const app = express();
  const analysisServiceUrl = getOptionalEnv("ANALYSIS_BASE_URL") || requireEnv("GATEWAY_ANALYSIS_URL");
 
  app.use(
      "/api/v1/data-analysis",
      createProxyMiddleware({
        target: analysisServiceUrl, 
        changeOrigin: true,
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('X-Gateway-Key', requireEnv("GATEWAY_API_KEY"));
            console.log(`[Gateway] Prosleđujem zahtev: ${req.method} ${req.url}`);
          },
        error: (err, req, res) => {
          console.error('[Gateway] Proxy Error:', err);
        }
      }
    })
  );
  // ===== BASIC MIDDLEWARE =====
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===== CORS =====
  const corsConfig = new CorsConfig();
  app.use(cors(corsConfig.buildOptions()));

  // ===== GATEWAY AUTH =====
  const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
  const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

  // ===== AUDIT CLIENT =====
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
  const loggerService: ILoggerService = new LoggerService(auditClient);
 
  const normalizeApiBaseUrl = (baseURL: string): string => {
    const trimmed = baseURL.trim().replace(/\/+$/, "");
    if (!trimmed) return trimmed;
    if (/\/api\/v1(\/|$)/.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed}/api/v1`;
  };

  const resolveServiceUrl = (primaryKey: string, fallbackKey: string): string => {
    const primary = getOptionalEnv(primaryKey);
    if (primary) {
      return normalizeApiBaseUrl(primary);
    }
    return normalizeApiBaseUrl(requireEnv(fallbackKey));
  };

  // ===== ANALYSIS CLIENT =====
 // const analysisServiceUrl = resolveServiceUrl("ANALYSIS_BASE_URL", "GATEWAY_ANALYSIS_URL");
  const analysisClient: IAnalysisClient = new AnalysisClient(
    analysisServiceUrl,
    gatewayApiKey
  );

  // ===== STORAGE CLIENT =====
  const storageServiceUrl = resolveServiceUrl("STORAGE_BASE_URL", "GATEWAY_STORAGE_URL");
  const storageClient: IStorageClient = new StorageClient(
    storageServiceUrl,
    gatewayApiKey
  );

  // ===== PROCESSING SERVICE URL =====
  const processingServiceUrl = resolveServiceUrl(
    "PROCESSING_BASE_URL",
    "PROCESSING_SERVICE_URL"
  );

  const perfumeCatalogClient: IPerfumeCatalogClient = new DatabasePerfumeCatalogClient(
    Db,
    storageClient,
    processingServiceUrl,
    gatewayApiKey
  );

  // ===== DEPENDENCY INJECTION =====
  const saleRepository = new TypeORMSaleRepository();
  const saleService = new SaleService(
    saleRepository, 
    auditClient,
    storageClient,
    analysisClient,
    perfumeCatalogClient
  );
  
  const salesController = new SalesController(
    saleService,
    loggerService);

  // ===== HEALTH CHECK =====
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      service: "sales-microservice",
    });
  });

  // ===== API ROUTES (PROTECTED) =====
  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());

  const requestAuditMiddleware = new RequestAuditMiddleware(loggerService);
  apiRouter.use(requestAuditMiddleware.getHandler());

  apiRouter.use("/sales", salesController.getRouter());
  app.use("/api/v1", apiRouter);

  // ===== ERROR HANDLER =====
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Interna greska servera" });
  });

  // ===== 404 =====
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta nije pronađena" });
  });

  return app;
}
