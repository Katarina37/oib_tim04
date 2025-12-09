import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { ProductionController } from "./WebAPI/controllers/ProductionController";
import { PlantsController } from "./WebAPI/controllers/PlantsController";
import { ProductionService } from "./Services/ProductionService";
import { PlantManagementService } from "./Services/PlantManagementService";
import { PlantRepository } from "./Services/PlantRepository";
import { LoggerService } from "./Services/LoggerService";

export function createApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Configuration
  const defaultOrigins = ["http://localhost:5173", "http://localhost:3000"];
  const rawOrigins =
    process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || "";
  const allowedOrigins = Array.from(
    new Set(
      [...defaultOrigins, ...rawOrigins.split(",")]
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    )
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Gateway-Key"],
      credentials: true,
    })
  );

  // Gateway API Key Middleware
  const gatewayKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const gatewayKey = req.headers["x-gateway-key"];
    const expectedKey = process.env.GATEWAY_API_KEY;

    if (gatewayKey !== expectedKey) {
      res.status(403).json({ message: "Pristup zabranjen" });
      return;
    }
    next();
  };

  // Dependency Injection
  const plantRepository = new PlantRepository();
  const loggerService = new LoggerService();
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
  app.use(gatewayKeyMiddleware);
  app.use(productionController.getRouter());
  app.use(plantsController.getRouter());

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
