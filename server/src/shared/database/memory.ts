import { randomUUID } from "node:crypto";
import type { UserRole } from "../types/auth.types";
import type { DocumentStatus } from "../types/common.types";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  rfidTag: string | null;
  sector: string;
  active: boolean;
  createdAt: Date;
}

export interface CategoryRecord {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
}

export interface GroupRecord {
  id: string;
  name: string;
  description: string | null;
}

export interface DocumentRecord {
  id: string;
  code: string;
  title: string;
  description: string | null;
  categoryId: string;
  groupId: string;
  currentRevisionId: string | null;
  status: DocumentStatus;
  createdAt: Date;
}

export interface RevisionRecord {
  id: string;
  documentId: string;
  revisionNumber: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  originalFileName: string;
  storageDiskPath: string | null;
  createdAt: Date;
}

export interface TagRecord {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

export interface DocumentTagRecord {
  id: string;
  documentId: string;
  tagId: string;
}

export interface UserGroupPermissionRecord {
  id: string;
  userId: string;
  groupId: string;
}

export interface LogRecord {
  id: string;
  userId: string;
  action: string;
  documentId: string | null;
  revisionId: string | null;
  timestamp: Date;
  ipAddress: string | null;
  device: string | null;
}

export interface CounterRecord {
  id: string;
  scope: string;
  currentValue: number;
}

export const memoryDb = {
  users: [] as UserRecord[],
  categories: [] as CategoryRecord[],
  groups: [] as GroupRecord[],
  documents: [] as DocumentRecord[],
  revisions: [] as RevisionRecord[],
  tags: [] as TagRecord[],
  documentTags: [] as DocumentTagRecord[],
  userGroupPermissions: [] as UserGroupPermissionRecord[],
  logs: [] as LogRecord[],
  counters: [] as CounterRecord[],
};

export function clearMemoryDatabase() {
  memoryDb.users = [];
  memoryDb.categories = [];
  memoryDb.groups = [];
  memoryDb.documents = [];
  memoryDb.revisions = [];
  memoryDb.tags = [];
  memoryDb.documentTags = [];
  memoryDb.userGroupPermissions = [];
  memoryDb.logs = [];
  memoryDb.counters = [];
}

export function nextMemoryId(): string {
  return randomUUID();
}
