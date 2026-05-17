import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import {
  authorizePermissions,
} from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { groupController } from "./groups.controller";
import { validateAssignUserGroupPermission, validateCreateGroup } from "./groups.validators";

export const groupRoutes = Router();

groupRoutes.use(authMiddleware);

groupRoutes.get("/", authorizePermissions(["groups:read"]), asyncHandler(groupController.list.bind(groupController)));
groupRoutes.post(
  "/",
  authorizePermissions(["groups:create"]),
  validateCreateGroup,
  asyncHandler(groupController.create.bind(groupController)),
);
groupRoutes.post(
  "/permissions",
  authorizePermissions(["groups:assign"]),
  validateAssignUserGroupPermission,
  asyncHandler(groupController.assignUserPermission.bind(groupController)),
);
