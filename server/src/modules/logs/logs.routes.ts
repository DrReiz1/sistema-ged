import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { logController } from "./logs.controller";
import { validateCreateRuntimeLog } from "./logs.validators";

export const logRoutes = Router();

logRoutes.use(authMiddleware);
logRoutes.get("/", authorizePermissions(["logs:read"]), asyncHandler(logController.list.bind(logController)));
logRoutes.post("/", authorizePermissions(["logs:create"]), validateCreateRuntimeLog, asyncHandler(logController.create.bind(logController)));
