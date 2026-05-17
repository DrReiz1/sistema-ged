import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middleware/validate.middleware";
import {
  createDocumentSchema,
  documentIdParamsSchema,
  listDocumentsQuerySchema,
} from "./documents.schema";

export const validateCreateDocument = validateBody(createDocumentSchema);
export const validateListDocuments = validateQuery(listDocumentsQuerySchema);
export const validateDocumentId = validateParams(documentIdParamsSchema);
