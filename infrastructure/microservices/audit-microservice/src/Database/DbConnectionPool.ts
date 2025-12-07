import { DataSource } from "typeorm";
import { AuditLog } from "../Domain/models/AuditLog";

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "audit_logovi",
  entities: [AuditLog],
  synchronize: false,
  logging: false,
});