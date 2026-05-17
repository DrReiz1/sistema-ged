import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { uploadMiddleware } from "../../shared/middleware/upload.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { revisionController } from "./revisions.controller";
import { validateRevisionDocumentId } from "./revisions.validators";

export const revisionRoutes = Router({ mergeParams: true });

revisionRoutes.use(authMiddleware);
revisionRoutes.post(
  "/",
  authorizePermissions(["revisions:create"]),
  validateRevisionDocumentId,
  uploadMiddleware.single("file"),
  asyncHandler(revisionController.create.bind(revisionController)),
);
