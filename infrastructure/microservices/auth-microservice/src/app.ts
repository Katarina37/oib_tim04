import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { User } from "./Domain/models/User";
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { IAuthService } from "./Domain/services/IAuthService";
import { AuthService } from "./Services/AuthService";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";
import { AuthController } from "./WebAPI/controllers/AuthController";
import { IUserRepository } from "./Domain/repositories/IUserRepository";
import { TypeOrmUserRepository } from "./Infrastructure/repositories/TypeOrmUserRepository";
import axios from "axios";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) || ["POST"];

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

  const userRepository: IUserRepository = new TypeOrmUserRepository(Db.getRepository(User));

  const auditServiceUrl = process.env.AUDIT_SERVICE_URL || "";
  const auditHttpClient = axios.create({
    baseURL: auditServiceUrl,
    headers: { "Content-Type": "application/json" },
    timeout: 5000,
  });
  const auditClient: IAuditClient = new AxiosAuditClient(auditHttpClient);
  const logerService: ILogerService = new LogerService(auditClient);

  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
  const authService: IAuthService = new AuthService(userRepository, saltRounds);
  const authController = new AuthController(authService, logerService);

  app.use("/api/v1", authController.getRouter());
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;
