import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { AuditLog } from "./Domain/models/AuditLog"
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { IAuditService } from "./Domain/services/IAuditService";
import { AuditService } from "./Services/AuditService";
import { AuditController } from "./WebAPI/controllers/AuditController";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) || ["GET", "POST", "PUT", "DELETE"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const initializeApp = async (): Promise<void> => {
  await initialize_database();
  
  const auditLogRepository: Repository<AuditLog> = Db.getRepository(AuditLog);
  const auditService: IAuditService = new AuditService(auditLogRepository);
  const auditController = new AuditController(auditService);
  
  app.use("/api/v1", auditController.getRouter());
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;