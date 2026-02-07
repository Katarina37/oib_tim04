import "reflect-metadata";
import { DataSource } from "typeorm";
import { requireEnv, requireIntEnv } from "../config/env";
import { FiscalBill } from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";


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
  entities: [FiscalBill, SalesReport, TopProductReport, TrendAnalysis],
});

export const Db = AppDataSource;