import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import { requireEnv, requireOneOfEnv } from "./config/env";
import { CorsConfig } from "./config/CorsConfig";

import { IGatewayService } from "./Domain/services/IGatewayService";
import { IAuthClient } from "./Domain/clients/IAuthClient";
import { IUserClient } from "./Domain/clients/IUserClient";
import { IMicroserviceClient } from "./Domain/clients/IMicroserviceClient";

import { GatewayService } from "./Services/GatewayService";
import { GatewayController } from "./WebAPI/GatewayController";
import { AxiosAuthClient } from "./Infrastructure/clients/AxiosAuthClient";
import { AxiosUserClient } from "./Infrastructure/clients/AxiosUserClient";
import { AxiosMicroserviceClient } from "./Infrastructure/clients/AxiosMicroserviceClient";

const app: Application = express();

const corsConfig = new CorsConfig();
app.use(cors(corsConfig.buildOptions()));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Environment variables
const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
requireEnv("JWT_SECRET");
const timeout = 5000;

// Create HTTP clients for each microservice
const createHttpClient = (baseURL: string, includeGatewayKey = false) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(includeGatewayKey ? { "X-Gateway-Key": gatewayApiKey } : {}),
    },
    timeout,
  });

const normalizeApiBaseUrl = (baseURL: string): string => {
  const trimmed = baseURL.trim().replace(/\/+$/, "");
  if (!trimmed) return trimmed;
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

// Auth service client
const authServiceUrl = normalizeApiBaseUrl(
  requireOneOfEnv(["AUTH_SERVICE_URL", "AUTH_SERVICE_API"])
);
const authHttpClient = createHttpClient(authServiceUrl, true);
const authClient: IAuthClient = new AxiosAuthClient(authHttpClient);

// User service client
const userServiceUrl = normalizeApiBaseUrl(
  requireOneOfEnv(["USER_SERVICE_URL", "USER_SERVICE_API"])
);
const userHttpClient = createHttpClient(userServiceUrl, true);
const userClient: IUserClient = new AxiosUserClient(userHttpClient);

// Production service client
const productionServiceUrl = normalizeApiBaseUrl(
  requireOneOfEnv(["PRODUCTION_SERVICE_URL", "PRODUCTION_SERVICE_API"])
);
const productionHttpClient = createHttpClient(productionServiceUrl);
const productionClient: IMicroserviceClient = new AxiosMicroserviceClient(
  productionHttpClient,
  gatewayApiKey
);

// Processing service client
const processingHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("PROCESSING_SERVICE_URL"))
);
const processingClient: IMicroserviceClient = new AxiosMicroserviceClient(
  processingHttpClient,
  gatewayApiKey
);

// Storage service client
const storageHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("STORAGE_SERVICE_URL"))
);
const storageClient: IMicroserviceClient = new AxiosMicroserviceClient(
  storageHttpClient,
  gatewayApiKey
);

// Sales service client
const salesHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("SALES_SERVICE_URL"))
);
const salesClient: IMicroserviceClient = new AxiosMicroserviceClient(salesHttpClient, gatewayApiKey);

// Data Analysis service client
const dataAnalysisHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("DATA_ANALYSIS_SERVICE_URL"))
);
const dataAnalysisClient: IMicroserviceClient = new AxiosMicroserviceClient(
  dataAnalysisHttpClient,
  gatewayApiKey
);

// Performance Analysis service client
const performanceAnalysisHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("PERFORMANCE_ANALYSIS_SERVICE_URL"))
);
const performanceAnalysisClient: IMicroserviceClient = new AxiosMicroserviceClient(
  performanceAnalysisHttpClient,
  gatewayApiKey
);

// Audit service client
const auditHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("AUDIT_SERVICE_URL"))
);
const auditClient: IMicroserviceClient = new AxiosMicroserviceClient(auditHttpClient, gatewayApiKey);

// Weather service client
const weatherHttpClient = createHttpClient(
  normalizeApiBaseUrl(requireEnv("WEATHER_SERVICE_URL"))
);
const weatherClient: IMicroserviceClient = new AxiosMicroserviceClient(weatherHttpClient, gatewayApiKey);

// Create gateway service with all dependencies
const gatewayService: IGatewayService = new GatewayService(
  authClient,
  userClient,
  productionClient,
  processingClient,
  storageClient,
  salesClient,
  dataAnalysisClient,
  performanceAnalysisClient,
  auditClient,
  weatherClient
);

// Create controller and register routes
const gatewayController = new GatewayController(gatewayService);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", service: "gateway-api" });
});

// API routes
app.use("/api/v1", gatewayController.getRouter());

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Gateway Error:", err.message);
  res.status(500).json({ message: "Interna greška servera" });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta nije pronađena" });
});

export default app;
