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
