import type { UserRole } from "../types/auth.types";

const rolePermissionsMap: Record<UserRole, string[]> = {
  operator: ["documents:read", "groups:read", "logs:create"],
  supervisor: ["documents:read", "groups:read", "logs:create", "logs:read", "revisions:read", "revisions:create"],
  admin: [
    "documents:read",
    "documents:create",
    "documents:update",
    "revisions:create",
    "users:read",
    "users:create",
    "groups:read",
    "groups:create",
    "groups:assign",
    "categories:read",
    "categories:create",
    "tags:read",
    "tags:create",
    "logs:read",
    "logs:create",
  ],
};

export function getPermissionsByRole(role: UserRole): string[] {
  return rolePermissionsMap[role] ?? [];
}
