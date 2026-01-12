import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import { CorsConfig } from "./WebApi/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebApi/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebApi/middleware/RequestAuditMiddleware";
import { PerformanceRepository } from "./Infrastructure/repositories/PerformanceRepository";
import { PerformanceService } from "./Services/PerformanceService";
import { LoggerService } from "./Services/LoggerService";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { PerformanceController } from "./WebApi/controllers/PerformanceController";
import { requireEnv } from "./config/env";

export async function createApp(): Promise<express.Application> {
    const app = express();

    //middleware
    app.use(helmet()); 
    app.use(express.json()); 

    //corsCinfig
    const corsConfig = new CorsConfig();
    app.use(cors(corsConfig.buildOptions()));

    //gateway
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
    //moj servis
    const logger = new LoggerService(auditClient, "analiza-performansi");

    //gateway autentifikacija
    const gatewayAuth = new GatewayAuthMiddleware(gatewayApiKey);
    app.use(gatewayAuth.getHandler());

    //logovanje preko http zahteva
    const requestAudit = new RequestAuditMiddleware(logger);
    app.use(requestAudit.getHandler());

    //repozitorijum, servis i kontroler
    const performanceRepository = new PerformanceRepository();
    const performanceService = new PerformanceService(performanceRepository);
    const performanceController = new PerformanceController(performanceService, logger);

    //rute
    app.use("/api/v1/performance", performanceController.getRouter());

    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "OK", service: "performance-microservice" });
    });

    //ako ruta ne postoji
    app.use((_req, res) => {
        res.status(404).json({ message: "Ruta nije pronađena" });
    });

    //error
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