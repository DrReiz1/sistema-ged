import { validateBody } from "../../shared/middleware/validate.middleware";
import { createUserSchema } from "./users.schema";

export const validateCreateUser = validateBody(createUserSchema);
