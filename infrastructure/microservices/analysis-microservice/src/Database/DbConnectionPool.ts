import "reflect-metadata";
import { DataSource } from "typeorm";
import { requireEnv, requireIntEnv } from "../config/env";
import { FiscalBillEntity } from "../Infrastructure/entities/FiscalBillEntity";
import { SalesReportEntity } from "../Infrastructure/entities/SalesReportEntity";
import { TopProductReportEntity } from "../Infrastructure/entities/TopProductReportEntity";
import { TrendAnalysisEntity } from "../Infrastructure/entities/TrendAnalysisEntity";


export const AppDataSource = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),  // "izvestaji_analize"
  ssl: { rejectUnauthorized: false },
  synchronize: false, 
  logging: false, 
  entities: [FiscalBillEntity, SalesReportEntity, TopProductReportEntity, TrendAnalysisEntity],
});

export const Db = AppDataSource;
