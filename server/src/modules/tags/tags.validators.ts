import { validateBody } from "../../shared/middleware/validate.middleware";
import { createTagSchema } from "./tags.schema";

export const validateCreateTag = validateBody(createTagSchema);
