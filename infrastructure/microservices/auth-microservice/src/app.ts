import express from "express";
import cors from "cors";
import "reflect-metadata";
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
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { requireEnv, requireIntEnv } from "./config/env";

const app = express();

const corsConfig = new CorsConfig();
const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
const jwtSecret = requireEnv("JWT_SECRET");
const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

app.use(
  cors(corsConfig.buildOptions())
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const initializeApp = async (): Promise<void> => {
  await initialize_database();

  const userRepository: IUserRepository = new TypeOrmUserRepository(Db.getRepository(User));

  const auditServiceUrl = requireEnv("GATEWAY_AUDIT_URL");
  const auditHttpClient = axios.create({
    baseURL: auditServiceUrl,
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Key": gatewayApiKey,
    },
    timeout: 5000,
  });
  const auditClient: IAuditClient = new AxiosAuditClient(auditHttpClient);
  const logerService: ILogerService = new LogerService(auditClient);

  const saltRounds = requireIntEnv("SALT_ROUNDS");
  if (saltRounds <= 0) {
    throw new Error("SALT_ROUNDS must be a positive integer.");
  }
  const authService: IAuthService = new AuthService(userRepository, saltRounds);
  const authController = new AuthController(authService, logerService, jwtSecret);

  app.use("/api/v1", gatewayAuthMiddleware.getHandler(), authController.getRouter());
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;
