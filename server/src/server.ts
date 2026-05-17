import { app } from "./app";
import { bootstrapMemoryDatabase } from "./shared/database/bootstrap";

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  await bootstrapMemoryDatabase();

  app.listen(port, "0.0.0.0", () => {
    console.log(`[docstation-api] listening on port ${port}`);
  });
}

void startServer();
