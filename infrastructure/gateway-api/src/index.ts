console.clear();
import app from "./app";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`\x1b[32m[Gateway API]\x1b[0m Server running on port ${port}`);
  console.log(`\x1b[36m[Routes]\x1b[0m`);
  console.log(`  POST /api/v1/login`);
  console.log(`  POST /api/v1/register`);
  console.log(`  GET  /api/v1/users (ADMIN)`);
  console.log(`  GET  /api/v1/users/:id (ADMIN)`);
  console.log(`  ALL  /api/v1/production/*path (SELLER, SALES_MANAGER)`);
  console.log(`  ALL  /api/v1/processing/*path (SELLER, SALES_MANAGER)`);
  console.log(`  ALL  /api/v1/storage/*path (SELLER, SALES_MANAGER)`);
  console.log(`  ALL  /api/v1/sales/*path (SELLER, SALES_MANAGER)`);
  console.log(`  ALL  /api/v1/data-analysis/*path (ADMIN)`);
  console.log(`  ALL  /api/v1/performance-analysis/*path (ADMIN)`);
  console.log(`  ALL  /api/v1/audit/*path (ADMIN)`);
});
