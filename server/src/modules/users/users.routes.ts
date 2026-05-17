import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { userController } from "./users.controller";
import { validateCreateUser } from "./users.validators";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/", authorizePermissions(["users:read"]), asyncHandler(userController.list.bind(userController)));
userRoutes.post(
  "/",
  authorizePermissions(["users:create"]),
  validateCreateUser,
  asyncHandler(userController.create.bind(userController)),
);
