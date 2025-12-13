import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import { IGatewayService } from "./Domain/services/IGatewayService";
import { IAuthClient } from "./Domain/clients/IAuthClient";
import { IUserClient } from "./Domain/clients/IUserClient";
import { IMicroserviceClient } from "./Domain/clients/IMicroserviceClient";

import { GatewayService } from "./Services/GatewayService";
import { GatewayController } from "./WebAPI/GatewayController";
import { AxiosAuthClient } from "./Infrastructure/clients/AxiosAuthClient";
import { AxiosUserClient } from "./Infrastructure/clients/AxiosUserClient";
import { AxiosMicroserviceClient } from "./Infrastructure/clients/AxiosMicroserviceClient";

dotenv.config();

const app: Application = express();

// CORS configuration from env
const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || ["*"];
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) || [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: corsMethods,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Environment variables
const gatewayApiKey = process.env.GATEWAY_API_KEY || "gateway-secret-key";
const timeout = 5000;

// Create HTTP clients for each microservice
const createHttpClient = (baseURL: string) =>
  axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout,
  });

const getServiceUrl = (url?: string, alt?: string, fallback?: string): string =>
  url || alt || fallback || "";

// Auth service client
const authServiceUrl = getServiceUrl(
  process.env.AUTH_SERVICE_URL,
  process.env.AUTH_SERVICE_API,
  "http://localhost:5001/api/v1"
);
const authHttpClient = createHttpClient(authServiceUrl);
const authClient: IAuthClient = new AxiosAuthClient(authHttpClient);

// User service client
const userServiceUrl = getServiceUrl(
  process.env.USER_SERVICE_URL,
  process.env.USER_SERVICE_API,
  "http://localhost:5002/api/v1"
);
const userHttpClient = createHttpClient(userServiceUrl);
const userClient: IUserClient = new AxiosUserClient(userHttpClient);

// Production service client
const productionHttpClient = createHttpClient(
  process.env.PRODUCTION_SERVICE_URL || "http://localhost:5004"
);
const productionClient: IMicroserviceClient = new AxiosMicroserviceClient(
  productionHttpClient,
  gatewayApiKey
);

// Processing service client
const processingHttpClient = createHttpClient(
  process.env.PROCESSING_SERVICE_URL || "http://localhost:5005/api/v1"
);
const processingClient: IMicroserviceClient = new AxiosMicroserviceClient(
  processingHttpClient,
  gatewayApiKey
);

// Storage service client
const storageHttpClient = createHttpClient(
  process.env.STORAGE_SERVICE_URL || "http://localhost:5006/api/v1"
);
const storageClient: IMicroserviceClient = new AxiosMicroserviceClient(
  storageHttpClient,
  gatewayApiKey
);

// Sales service client
const salesHttpClient = createHttpClient(
  process.env.SALES_SERVICE_URL || "http://localhost:5007/api/v1"
);
const salesClient: IMicroserviceClient = new AxiosMicroserviceClient(salesHttpClient, gatewayApiKey);

// Data Analysis service client
const dataAnalysisHttpClient = createHttpClient(
  process.env.DATA_ANALYSIS_SERVICE_URL || "http://localhost:5008/api/v1"
);
const dataAnalysisClient: IMicroserviceClient = new AxiosMicroserviceClient(
  dataAnalysisHttpClient,
  gatewayApiKey
);

// Performance Analysis service client
const performanceAnalysisHttpClient = createHttpClient(
  process.env.PERFORMANCE_ANALYSIS_SERVICE_URL || "http://localhost:5009/api/v1"
);
const performanceAnalysisClient: IMicroserviceClient = new AxiosMicroserviceClient(
  performanceAnalysisHttpClient,
  gatewayApiKey
);

// Audit service client
const auditHttpClient = createHttpClient(
  process.env.AUDIT_SERVICE_URL || "http://localhost:5003/api/v1"
);
const auditClient: IMicroserviceClient = new AxiosMicroserviceClient(auditHttpClient, gatewayApiKey);

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
  auditClient
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
