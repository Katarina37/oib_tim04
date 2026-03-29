import { Db } from "./DbConnectionPool";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await Db.initialize();
    console.log("\x1b[32m[Database@1.0]\x1b[0m Connected to notification_center database");
  } catch (error) {
    console.error("\x1b[31m[Database@1.0]\x1b[0m Failed to connect to database:", error);
    throw error;
  }
};
