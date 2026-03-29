console.clear();
import { requireIntEnv } from "./config/env";

const app = require("./app").default;

const port = requireIntEnv("PORT");

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
  console.log("\x1b[36m[Routes]\x1b[0m");
  console.log("  POST /api/v1/notifications/internal/events");
  console.log("  GET  /api/v1/notifications");
  console.log("  GET  /api/v1/notifications/unread-count");
  console.log("  PATCH /api/v1/notifications/:id/read");
  console.log("  PATCH /api/v1/notifications/read-all");
  console.log("  GET  /api/v1/notifications/email-log");
});
