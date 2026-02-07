import "reflect-metadata";
import { DataSource } from "typeorm";
import { PackageEntity } from "../Infrastructure/entities/PackageEntity";
import { WarehouseEntity } from "../Infrastructure/entities/WarehouseEntity";
import { PackagePerfumeEntity } from "../Infrastructure/entities/PackagePerfumeEntity";
import { requireEnv, requireIntEnv } from "../config/env";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  ssl: { rejectUnauthorized: false },
  synchronize: true, 
  logging: false, 
  entities: [PackageEntity, WarehouseEntity, PackagePerfumeEntity],
});

export const Db = AppDataSource;
