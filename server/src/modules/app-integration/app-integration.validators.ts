import { validateBody } from "../../shared/middleware/validate.middleware";
import { createAppLogSchema, syncAppUserAccessSchema, validateBadgeSchema } from "./app-integration.schema";

export const validateSyncAppUserAccess = validateBody(syncAppUserAccessSchema);
export const validateBadge = validateBody(validateBadgeSchema);
export const validateCreateAppLog = validateBody(createAppLogSchema);
