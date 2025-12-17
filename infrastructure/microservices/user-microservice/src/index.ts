console.clear();
import { requireIntEnv } from "./config/env";
import app from './app';

const port = requireIntEnv("PORT");

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
});
