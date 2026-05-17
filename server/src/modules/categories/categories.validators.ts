import { validateBody } from "../../shared/middleware/validate.middleware";
import { createCategorySchema } from "./categories.schema";

export const validateCreateCategory = validateBody(createCategorySchema);
