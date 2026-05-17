import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { categoryController } from "./categories.controller";
import { validateCreateCategory } from "./categories.validators";

export const categoryRoutes = Router();

categoryRoutes.use(authMiddleware);
categoryRoutes.get("/", authorizePermissions(["categories:read"]), asyncHandler(categoryController.list.bind(categoryController)));
categoryRoutes.post(
  "/",
  authorizePermissions(["categories:create"]),
  validateCreateCategory,
  asyncHandler(categoryController.create.bind(categoryController)),
);
