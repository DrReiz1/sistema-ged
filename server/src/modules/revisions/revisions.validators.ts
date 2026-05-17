import { validateParams } from "../../shared/middleware/validate.middleware";
import { revisionDocumentIdParamsSchema } from "./revisions.schema";

export const validateRevisionDocumentId = validateParams(revisionDocumentIdParamsSchema);
