import { validateBody } from "../../shared/middleware/validate.middleware";
import { createLogSchema, createRuntimeLogSchema } from "./logs.schema";

export const validateCreateLog = validateBody(createLogSchema);
export const validateCreateRuntimeLog = validateBody(createRuntimeLogSchema);
