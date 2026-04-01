import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import { initializeDatabase } from "./Database/InitializeConnection";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { RecommendationRepository } from "./Services/RecommendationRepository";
import { RecommendationService } from "./Services/RecommendationService";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { RecommendationController } from "./WebAPI/controllers/RecommendationController";
import { requireEnv } from "./config/env";

export async function createApp(): Promise<express.Application> {
    const app = express();
    app.use(helmet());
    app.use(express.json());

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
    const logger = new LoggerService(auditClient, "preporuka-mikroservis");

    const gatewayAuth = new GatewayAuthMiddleware(gatewayApiKey);
    app.use(gatewayAuth.getHandler());

    const requestAudit = new RequestAuditMiddleware(logger);
    app.use(requestAudit.getHandler());

    const recommendationRepository = new RecommendationRepository();
    const recommendationService = new RecommendationService(recommendationRepository, logger);
    const recommendationController = new RecommendationController(recommendationService, logger);

    app.use("/api/v1/recommendations", recommendationController.getRouter());

    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "OK",
            service: "recommendation-microservice"
        });
    });

    app.use((_req, res) => {
        res.status(404).json({ message: "Ruta nije pronađena" });
    });
    
    app.use((
        error: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error("Unhandled error:", error);
        res.status(500).json({ message: "Interna greška servera" });
    });

    return app;
}