import express from "express";
import cors from "cors";
import "reflect-metadata";
import { initialize_database } from "./Database/InitializeConnection";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { User } from "./Domain/models/User";
import { Db } from "./Database/DbConnectionPool";
import { IUsersService } from "./Domain/services/IUsersService";
import { UsersService } from "./Services/UsersService";
import { UsersController } from "./WebAPI/controllers/UsersController";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ?? ["GET", "POST", "PUT", "DELETE"];

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
  const userService: IUsersService = new UsersService(userRepository);
  const userController = new UsersController(userService, logerService);
  app.use("/api/v1", userController.getRouter());
};

initializeApp().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});

export default app;