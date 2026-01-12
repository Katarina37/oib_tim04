console.clear();
import { requireIntEnv } from "./config/env";
import { createApp } from "./app";
import { initialize_database } from './DataBase/InitializeConnection';


async function bootstrap(): Promise<void> {
  try {
    await initialize_database();
    
    const app = await createApp();
    
    const port = requireIntEnv("PORT");
    
    app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
    });
  } catch (error) {
    console.error('\x1b[31m[FatalError]\x1b[0m Failed to start Sales server:', error);
    process.exit(1);
  }
}

bootstrap();