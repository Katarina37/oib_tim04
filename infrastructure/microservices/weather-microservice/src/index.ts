console.clear();
import { requireIntEnv } from "./config/env";
import { createApp } from "./app";
import { initializeDatabase } from "./Database/InitializeConnection";

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    const app = createApp();
    const port = requireIntEnv("PORT");
    app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
      console.log(`\x1b[36m[Routes]\x1b[0m`);
      console.log(`  GET  /api/v1/weather`);
      console.log(`  GET  /api/v1/weather/month/:yearMonth`);
      console.log(`  GET  /api/v1/weather/:date`);
      console.log(`  POST /api/v1/weather`);
      console.log(`  POST /api/v1/weather/:date/apply-effects`);
      console.log(`  DELETE /api/v1/weather/:date`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
