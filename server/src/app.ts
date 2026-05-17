import express from "express";
import { registerModuleRoutes } from "./modules";
import { errorHandler } from "./shared/middleware/error-handler.middleware";
import { requestLoggerMiddleware } from "./shared/middleware/request-logger.middleware";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLoggerMiddleware);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    name: "DocStation GED Industrial API",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

registerModuleRoutes(app);

app.use(errorHandler);
