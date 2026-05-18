import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { appIntegrationController } from "./app-integration.controller";
import { validateBadge, validateCreateAppLog, validateSyncAppUserAccess } from "./app-integration.validators";

export const appIntegrationRoutes = Router();

appIntegrationRoutes.post("/validate-badge", validateBadge, asyncHandler(appIntegrationController.validateBadge.bind(appIntegrationController)));
appIntegrationRoutes.get("/users/:userId/documents", asyncHandler(appIntegrationController.listDocuments.bind(appIntegrationController)));
appIntegrationRoutes.post("/logs", validateCreateAppLog, asyncHandler(appIntegrationController.createLog.bind(appIntegrationController)));

appIntegrationRoutes.use(authMiddleware);
appIntegrationRoutes.get("/users", authorizePermissions(["users:read"]), asyncHandler(appIntegrationController.listUsers.bind(appIntegrationController)));
appIntegrationRoutes.put("/users/:userId/access", authorizePermissions(["groups:assign"]), validateSyncAppUserAccess, asyncHandler(appIntegrationController.syncUserAccess.bind(appIntegrationController)));
