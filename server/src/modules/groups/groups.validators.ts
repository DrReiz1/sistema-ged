import { validateBody } from "../../shared/middleware/validate.middleware";
import { assignUserGroupPermissionSchema, createGroupSchema } from "./groups.schema";

export const validateCreateGroup = validateBody(createGroupSchema);
export const validateAssignUserGroupPermission = validateBody(assignUserGroupPermissionSchema);
