export interface CreateLogInput {
  userId: string;
  action: string;
  documentId: string | null;
  revisionId: string | null;
  timestamp: Date;
  ipAddress: string | null;
  device: string | null;
}

export interface CreateRuntimeLogInput {
  action: string;
  documentId?: string | null;
  revisionId?: string | null;
  timestamp?: Date;
}
