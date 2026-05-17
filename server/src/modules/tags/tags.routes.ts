import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { tagController } from "./tags.controller";
import { validateCreateTag } from "./tags.validators";

export const tagRoutes = Router();

tagRoutes.use(authMiddleware);
tagRoutes.get("/", authorizePermissions(["tags:read"]), asyncHandler(tagController.list.bind(tagController)));
tagRoutes.post("/", authorizePermissions(["tags:create"]), validateCreateTag, asyncHandler(tagController.create.bind(tagController)));
