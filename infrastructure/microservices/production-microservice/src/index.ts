console.clear();
import { createApp } from './app';
import { initializeDatabase } from './Database/InitializeConnection';

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    const app = createApp();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();