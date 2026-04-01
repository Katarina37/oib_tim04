import "reflect-metadata";
import { DataSource } from "typeorm";
import { requireEnv, requireIntEnv } from "../config/env";
import { UserRecommendationEntity } from "../Infrastructure/entities/UserRecommendationEntity";
import { ItemCoOccurrenceEntity } from "../Infrastructure/entities/ItemCoOccurrenceEntity";

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
  entities: [UserRecommendationEntity, ItemCoOccurrenceEntity],
});

export const Db = AppDataSource;