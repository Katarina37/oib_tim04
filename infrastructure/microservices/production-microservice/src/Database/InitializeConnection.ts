import { AppDataSource } from "./DbConnectionPool";

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected");
  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization ", err);
    throw err;
  }
}