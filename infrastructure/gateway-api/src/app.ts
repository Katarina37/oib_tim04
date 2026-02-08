import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import { getOneOfEnv, getOptionalEnv, requireEnv, requireOneOfEnv } from "./config/env";
import { CorsConfig } from "./config/CorsConfig";

import { IGatewayService } from "./Domain/services/IGatewayService";
import { IAuthClient } from "./Domain/clients/IAuthClient";
import { IUserClient } from "./Domain/clients/IUserClient";
import { IMicroserviceClient } from "./Domain/clients/IMicroserviceClient";

import { GatewayService } from "./Services/GatewayService";
import { UserAccessPolicy } from "./Services/UserAccessPolicy";
import { GatewayController } from "./WebAPI/GatewayController";
import { AxiosAuthClient } from "./Infrastructure/clients/AxiosAuthClient";
import { AxiosUserClient } from "./Infrastructure/clients/AxiosUserClient";
import { AxiosMicroserviceClient } from "./Infrastructure/clients/AxiosMicroserviceClient";
import { IUserAccessPolicy } from "./Domain/services/IUserAccessPolicy";

const app: Application = express();

const corsConfig = new CorsConfig();
app.use(cors(corsConfig.buildOptions()));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Environment variables
const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
requireEnv("JWT_SECRET");
const timeoutFromEnv = Number.parseInt(
  getOptionalEnv("MICROSERVICE_TIMEOUT_MS") ?? "30000",
  10
);
const timeout = Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0 ? timeoutFromEnv : 30000;

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

const createGatewayMicroserviceClient = (baseURL: string): IMicroserviceClient => {
  const httpClient = createHttpClient(baseURL);
  return new AxiosMicroserviceClient(httpClient, gatewayApiKey);
};

const createRequiredGatewayMicroserviceClient = (envKeys: string[]): IMicroserviceClient => {
  return createGatewayMicroserviceClient(normalizeApiBaseUrl(requireOneOfEnv(envKeys)));
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
const productionClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "PRODUCTION_SERVICE_URL",
  "PRODUCTION_SERVICE_API",
]);

// Processing service client
const processingClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "PROCESSING_SERVICE_URL",
  "PROCESSING_SERVICE_API",
]);

// Packaging service client
const packagingServiceUrlFromEnv = getOneOfEnv([
  "PACKAGING_SERVICE_URL",
  "PACKAGING_SERVICE_API",
  "PACKAGING_BASE_URL",
]);
const packagingServiceUrl = packagingServiceUrlFromEnv || "http://localhost:5008/api/v1";
if (!packagingServiceUrlFromEnv) {
  console.warn(
    "[Gateway API] Packaging URL not found in env, using fallback http://localhost:5008/api/v1"
  );
}
const packagingClient: IMicroserviceClient = createGatewayMicroserviceClient(
  normalizeApiBaseUrl(packagingServiceUrl)
);

// Storage service client
const storageClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "STORAGE_SERVICE_URL",
]);

// Sales service client
const salesClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "SALES_SERVICE_URL",
]);

// Data Analysis service client
const dataAnalysisClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "DATA_ANALYSIS_SERVICE_URL",
]);

// Performance Analysis service client
const performanceAnalysisClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "PERFORMANCE_ANALYSIS_SERVICE_URL",
]);

// Audit service client
const auditClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "AUDIT_SERVICE_URL",
]);

// Weather service client
const weatherClient: IMicroserviceClient = createRequiredGatewayMicroserviceClient([
  "WEATHER_SERVICE_URL",
]);

// Create gateway service with all dependencies
const gatewayService: IGatewayService = new GatewayService(
  authClient,
  userClient,
  productionClient,
  processingClient,
  packagingClient,
  storageClient,
  salesClient,
  dataAnalysisClient,
  performanceAnalysisClient,
  auditClient,
  weatherClient
);

const userAccessPolicy: IUserAccessPolicy = new UserAccessPolicy();

// Create controller and register routes
const gatewayController = new GatewayController(
  gatewayService,
  gatewayApiKey,
  userAccessPolicy
);

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
