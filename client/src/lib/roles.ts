export type UserRole = "administrador" | "supervisor" | "operador";

export interface RoleConfig {
  label: string;
  badgeClass: string;
  allowedRoutes: string[];
  canUpload: boolean;
  canDelete: boolean;
  canEditMetadata: boolean;
  canPublishRevision: boolean;
  canManageUsers: boolean;
  canViewLogs: boolean;
  canManageTags: boolean;
  canManageTypes: boolean;
  canSettings: boolean;
  canCustomize: boolean;
  canBatchCompletion: boolean;
}

export const roleConfig: Record<UserRole, RoleConfig> = {
  operador: {
    label: "Operador",
    badgeClass: "bg-blue-100 text-blue-700",
    allowedRoutes: ["/dashboard", "/documents"],
    canUpload: false,
    canDelete: false,
    canEditMetadata: false,
    canPublishRevision: false,
    canManageUsers: false,
    canViewLogs: false,
    canManageTags: false,
    canManageTypes: false,
    canSettings: false,
    canCustomize: false,
    canBatchCompletion: true,
  },
  supervisor: {
    label: "Supervisor",
    badgeClass: "bg-amber-100 text-amber-700",
    allowedRoutes: [
      "/dashboard", "/documents", "/tags",
      "/doc-types", "/history", "/settings",
    ],
    canUpload: false,
    canDelete: false,
    canEditMetadata: true,
    canPublishRevision: false,
    canManageUsers: false,
    canViewLogs: true,
    canManageTags: true,
    canManageTypes: true,
    canSettings: true,
    canCustomize: false,
    canBatchCompletion: true,
  },
  administrador: {
    label: "Administrador",
    badgeClass: "bg-red-100 text-[#FF201A]",
    allowedRoutes: [
      "/dashboard", "/documents", "/tags",
      "/doc-types", "/history", "/settings",
      "/customize", "/groups", "/upload",
    ],
    canUpload: true,
    canDelete: true,
    canEditMetadata: true,
    canPublishRevision: true,
    canManageUsers: true,
    canViewLogs: true,
    canManageTags: true,
    canManageTypes: true,
    canSettings: true,
    canCustomize: true,
    canBatchCompletion: true,
  },
};

export function getRole(role?: string): UserRole {
  if (role === "admin") return "administrador";
  if (role === "operator") return "operador";
  if (role === "administrador" || role === "supervisor" || role === "operador") return role;
  return "operador";
}
