import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "../Infrastructure/entities/UserEntity";
import { requireEnv, requireIntEnv } from "../config/env";

export const Db = new DataSource({
  type: "mysql",
  host: requireEnv("DB_HOST"),
  port: requireIntEnv("DB_PORT"),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  ssl: { rejectUnauthorized: false },
  synchronize: true, // automatsko kreiranje tabela u bazi
  logging: false, // debug sql gresaka
  entities: [UserEntity],
});
