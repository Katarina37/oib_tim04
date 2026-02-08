import "reflect-metadata";
import { DataSource } from "typeorm";
import { requireEnv, requireIntEnv } from "../config/env";
import { PerformanceReportEntity } from "../Infrastructure/entities/PerformanceReportEntity";

export const Db = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: false,
  entities: [PerformanceReportEntity],
});
