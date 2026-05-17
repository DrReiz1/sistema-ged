import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorizePermissions } from "../../shared/middleware/authorization.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { documentController } from "./documents.controller";
import {
  validateCreateDocument,
  validateDocumentId,
  validateListDocuments,
} from "./documents.validators";

export const documentRoutes = Router();

documentRoutes.use(authMiddleware);

documentRoutes.get("/:id/preview", validateDocumentId, authorizePermissions(["documents:read"]), asyncHandler(documentController.preview.bind(documentController)));
documentRoutes.get("/:id/download", validateDocumentId, authorizePermissions(["documents:read"]), asyncHandler(documentController.download.bind(documentController)));
documentRoutes.get("/", validateListDocuments, authorizePermissions(["documents:read"]), asyncHandler(documentController.list.bind(documentController)));
documentRoutes.get("/:id", validateDocumentId, authorizePermissions(["documents:read"]), asyncHandler(documentController.getById.bind(documentController)));
documentRoutes.post("/", validateCreateDocument, authorizePermissions(["documents:create"]), asyncHandler(documentController.create.bind(documentController)));
documentRoutes.delete("/:id", validateDocumentId, authorizePermissions(["documents:update"]), asyncHandler(documentController.remove.bind(documentController)));
