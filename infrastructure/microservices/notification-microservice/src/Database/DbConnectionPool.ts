import { DataSource } from "typeorm";
import { Notification } from "../Domain/models/Notification";
import { NotificationEmailLog } from "../Domain/models/NotificationEmailLog";

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "notification_center",
  entities: [Notification, NotificationEmailLog],
  synchronize: false,
  logging: false,
});
