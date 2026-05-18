import type { Express } from "express";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./users/users.routes";
import { documentRoutes } from "./documents/documents.routes";
import { revisionRoutes } from "./revisions/revisions.routes";
import { tagRoutes } from "./tags/tags.routes";
import { categoryRoutes } from "./categories/categories.routes";
import { logRoutes } from "./logs/logs.routes";
import { groupRoutes } from "./groups/groups.routes";
import { appIntegrationRoutes } from "./app-integration/app-integration.routes";

export function registerModuleRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/documents/:documentId/revisions", revisionRoutes);
  app.use("/api/tags", tagRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/logs", logRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/app", appIntegrationRoutes);
}
