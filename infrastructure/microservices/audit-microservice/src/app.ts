import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { AuditLog } from "./Domain/models/AuditLog"
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { IAuditService } from "./Domain/services/IAuditService";
import { AuditService } from "./Services/AuditService";
import { AuditController } from "./WebAPI/controllers/AuditController";
import { IAuditLogRepository } from "./Domain/repositories/IAuditLogRepository";
import { TypeOrmAuditLogRepository } from "./Infrastructure/repositories/TypeOrmAuditLogRepository";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { LoggerService } from "./Services/LoggerService";
import { ILoggerService } from "./Domain/services/ILoggerService";

dotenv.config();

const app = express();

const corsConfig = new CorsConfig();
const gatewayApiKey = process.env.GATEWAY_API_KEY;
if (!gatewayApiKey) {
  throw new Error("GATEWAY_API_KEY is not set. Audit service cannot start without it.");
}
const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

app.use(
  cors(corsConfig.buildOptions())
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const initializeApp = async (): Promise<void> => {
  await initialize_database();
  
  const auditLogRepository: IAuditLogRepository = new TypeOrmAuditLogRepository(
    Db.getRepository(AuditLog)
  );
  const auditService: IAuditService = new AuditService(auditLogRepository);
  const logger: ILoggerService = new LoggerService();
  const requestAuditMiddleware = new RequestAuditMiddleware(logger);
  const auditController = new AuditController(auditService);
  
  app.use(
    "/api/v1",
    gatewayAuthMiddleware.getHandler(),
    requestAuditMiddleware.getHandler(),
    auditController.getRouter()
  );
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;
