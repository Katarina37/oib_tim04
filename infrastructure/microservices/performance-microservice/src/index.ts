console.clear();
import { requireIntEnv } from "./config/env";
import { createApp } from "./app";
import { initialize_database } from "./Database/InitializeConnection";

async function bootstrap(): Promise<void> {
  try {
    //inicijalizacija baze - InitializeConnection
    await initialize_database();

    //kreiram app
    const app = await createApp();

    //ucitavam port
    const port = requireIntEnv("PORT");

    //pokrecem servis
    app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
      console.log(`\x1b[36m[Service]\x1b[0m Performance Microservice is ready.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();