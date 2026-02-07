import "reflect-metadata";
import { DataSource } from "typeorm";

import { requireEnv, requireIntEnv } from "../config/env";
import { SaleItemEntity } from "../Infrastructure/entities/SaleItemEntity";
import { SaleEntity } from "../Infrastructure/entities/SaleEntity";

export const Db = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  ssl: { rejectUnauthorized: false },
  synchronize: false, // automatsko kreiranje tabela u bazi
  logging: false, // debug sql gresaka
  entities: [SaleEntity, SaleItemEntity],
  connectorPackage: "mysql2",
  //proveri extra
  extra: {
    connectionLimit: 10, // velicina pool-a konekcija
  }
});
