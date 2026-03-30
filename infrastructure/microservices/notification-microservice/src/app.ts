import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import "reflect-metadata";

import { Db } from "./Database/DbConnectionPool";
import { initializeDatabase } from "./Database/InitializeConnection";
import { Notification } from "./Domain/models/Notification";
import { NotificationEmailLog } from "./Domain/models/NotificationEmailLog";
import { INotificationRepository } from "./Domain/repositories/INotificationRepository";
import { INotificationService } from "./Domain/services/INotificationService";
import { TypeOrmNotificationRepository } from "./Infrastructure/repositories/TypeOrmNotificationRepository";
import { NotificationService } from "./Services/NotificationService";
import { NotificationController } from "./WebAPI/controllers/NotificationController";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { requireEnv } from "./config/env";

const app: Application = express();

const corsConfig = new CorsConfig();
app.use(cors(corsConfig.buildOptions()));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

const initializeApp = async (): Promise<void> => {
  await initializeDatabase();

  const notificationRepository: INotificationRepository = new TypeOrmNotificationRepository(
    Db.getRepository(Notification),
    Db.getRepository(NotificationEmailLog)
  );

  const notificationService: INotificationService = new NotificationService(notificationRepository);
  const notificationController = new NotificationController(notificationService);

  const apiRouter = express.Router();
  apiRouter.use(gatewayAuthMiddleware.getHandler());
  apiRouter.use(notificationController.getRouter());

  app.use("/api/v1", apiRouter);
};

initializeApp().catch((error) => {
  console.error("Failed to initialize notification service:", error);
  process.exit(1);
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", service: "notification-microservice" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Notification service error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
