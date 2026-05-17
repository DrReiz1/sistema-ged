import { createServer } from "http";
import { app } from "./src/app";
import { bootstrapMemoryDatabase } from "./src/shared/database/bootstrap";
import { serveStatic } from "./static";
import { setupVite } from "./vite";

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  await bootstrapMemoryDatabase();

  const server = createServer(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(server, app);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`[docstation-app] listening on port ${port}`);
  });
}

void startServer();
