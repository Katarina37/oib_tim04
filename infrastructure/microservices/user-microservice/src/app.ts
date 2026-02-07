import express from "express";
import cors from "cors";
import "reflect-metadata";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { IUsersService } from "./Domain/services/IUsersService";
import { UsersService } from "./Services/UsersService";
import { UsersController } from "./WebAPI/controllers/UsersController";
import { ILogerService } from "./Domain/services/ILoggerService";
import { LogerService } from "./Services/LoggerService";
import { IUserRepository } from "./Domain/repositories/IUserRepository";
import { TypeOrmUserRepository } from "./Infrastructure/repositories/TypeOrmUserRepository";
import axios from "axios";
import { AxiosAuditClient } from "./Infrastructure/clients/AxiosAuditClient";
import { IAuditClient } from "./Domain/services/IAuditClient";
import { CorsConfig } from "./WebAPI/middleware/CorsConfig";
import { GatewayAuthMiddleware } from "./WebAPI/middleware/GatewayAuthMiddleware";
import { RequestAuditMiddleware } from "./WebAPI/middleware/RequestAuditMiddleware";
import { requireEnv, requireIntEnv } from "./config/env";
import { UserEntity } from "./Infrastructure/entities/UserEntity";

const app = express();

const corsConfig = new CorsConfig();
const gatewayApiKey = requireEnv("GATEWAY_API_KEY");
const gatewayAuthMiddleware = new GatewayAuthMiddleware(gatewayApiKey);

app.use(
  cors(corsConfig.buildOptions())
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const initializeApp = async (): Promise<void> => {
  await initialize_database();
  const userRepository: IUserRepository = new TypeOrmUserRepository(Db.getRepository(UserEntity));

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
  const requestAuditMiddleware = new RequestAuditMiddleware(logerService);

  const saltRounds = requireIntEnv("SALT_ROUNDS");
  if (saltRounds <= 0) {
    throw new Error("SALT_ROUNDS must be a positive integer.");
  }
  const userService: IUsersService = new UsersService(userRepository, saltRounds);
  const userController = new UsersController(userService, logerService);
  app.use(
    "/api/v1",
    gatewayAuthMiddleware.getHandler(),
    requestAuditMiddleware.getHandler(),
    userController.getRouter()
  );
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;
