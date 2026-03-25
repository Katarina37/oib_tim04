import "reflect-metadata";
import { DataSource } from "typeorm";
import { SecurityIncident } from "../Domain/models/SecurityIncident";
import { requireEnv, requireIntEnv } from "../config/env";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: false,
  entities: [SecurityIncident],
});

export const Db = AppDataSource;
