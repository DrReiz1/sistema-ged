export interface ApiCategory {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
}

export interface ApiGroup {
  id: string;
  name: string;
  description: string | null;
}

export interface ApiTag {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface ApiRevision {
  id: string;
  documentId: string;
  revisionNumber: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName?: string;
  originalFileName?: string;
  createdAt: string;
}

export interface ApiDocument {
  id: string;
  code: string;
  title: string;
  description: string | null;
  categoryId: string;
  groupId: string;
  currentRevisionId: string | null;
  status: "active" | "archived" | "draft";
  createdAt: string;
  category: ApiCategory | null;
  group: ApiGroup | null;
  tags: ApiTag[];
  revisions: ApiRevision[];
  currentRevision: ApiRevision | null;
}

export interface ApiLog {
  id: string;
  userId: string;
  userName?: string | null;
  userOperatorId?: string | null;
  action: string;
  documentId: string | null;
  revisionId: string | null;
  timestamp: string;
  ipAddress: string | null;
  device: string | null;
  source?: "system" | "app";
  groupId?: string | null;
  rfidTagSnapshot?: string | null;
}

export interface ApiAppProfile {
  employeeActive: boolean;
  nfcCode: string | null;
  nfcActive: boolean;
}

export interface ApiAppUserAccess {
  id: string;
  userId: string;
  categoryId: string;
  accessUntil: string | null;
  enabled: boolean;
  createdAt: string;
  category: ApiCategory | null;
}

export interface ApiAppValidationResponse {
  userId: string;
  name: string;
  operatorId: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "operator";
  operatorId: string;
  rfidTag: string | null;
  sector: string;
  active: boolean;
  createdAt: string;
  groups: ApiGroup[];
  appProfile: ApiAppProfile;
  appAccess: ApiAppUserAccess[];
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function mapStatusLabel(status: ApiDocument["status"]): string {
  if (status === "active") return "Ativo";
  if (status === "draft") return "Rascunho";
  return "Arquivado";
}

export function mapStatusClass(status: ApiDocument["status"]): string {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "draft") return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

export function buildDocumentQuery(params: {
  search?: string;
  categoryId?: string;
  tagId?: string;
  groupId?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.tagId) searchParams.set("tagId", params.tagId);
  if (params.groupId) searchParams.set("groupId", params.groupId);

  const query = searchParams.toString();
  return query ? `/api/documents?${query}` : "/api/documents";
}
