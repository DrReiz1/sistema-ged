import { validateBody } from "../../shared/middleware/validate.middleware";
import { loginSchema, rfidLoginSchema } from "./auth.schema";

export const validateLogin = validateBody(loginSchema);
export const validateRfidLogin = validateBody(rfidLoginSchema);
