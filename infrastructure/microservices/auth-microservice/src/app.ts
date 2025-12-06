import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { User } from "./Domain/models/User";
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { IAuthService } from "./Domain/services/IAuthService";
import { AuthService } from "./Services/AuthService";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";
import { AuthController } from "./WebAPI/controllers/AuthController";

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

  const userRepository: Repository<User> = Db.getRepository(User);
  const logerService: ILogerService = new LogerService();
  const authService: IAuthService = new AuthService(userRepository);
  const authController = new AuthController(authService, logerService);

  app.use("/api/v1", authController.getRouter());
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;