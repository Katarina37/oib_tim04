import { Db } from "./DBConnectionPool"

export async function initializeDatabase(): Promise<void> {
  if (Db.isInitialized) {
    return;
  }

  try {
    await Db.initialize();
    console.log("\x1b[34m[DbConn@1.0.0]\x1b[0m Database connected");
  } catch (error) {
    console.error(
      "\x1b[31m[DbConn@1.0.0]\x1b[0m Error during DataSource initialization",
      error
    );
    throw error;
  }
}
