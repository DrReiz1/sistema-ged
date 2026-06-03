export interface SyncAppUserAccessInput {
  userId: string;
  categoryIds: string[];
  accessUntil: Date | null;
  enabled: boolean;
  employeeActive: boolean;
  nfcCode: string | null;
  nfcActive: boolean;
}

export interface ValidateBadgeInput {
  rfidTag: string;
}

export interface CreateAppLogInput {
  userId: string;
  action: string;
  documentId?: string | null;
  device?: string | null;
  ipAddress?: string | null;
}

export interface AppSourceEmployeeInput {
  id: string;
  fullName: string;
  operatorId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AppSourceNfcTagInput {
  id: string;
  employeeId: string;
  nfcCode: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AppSourceDocumentInput {
  id: string;
  title: string;
  description: string;
  viewerUrl: string;
  fileType: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AppSourceEmployeeDocumentPermissionInput {
  id: string;
  employeeId: string;
  documentId: string;
  grantedUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
}
