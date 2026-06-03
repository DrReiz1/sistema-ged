import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  operatorId: text("operator_id"),
  rfidTag: text("rfid_tag"),
  sector: text("sector").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  prefix: text("prefix").notNull().unique(),
  description: text("description"),
});

export const groupsTable = pgTable("document_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const documentsTable = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").notNull(),
  groupId: varchar("group_id").notNull(),
  currentRevisionId: varchar("current_revision_id"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const revisionsTable = pgTable("document_revisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  revisionNumber: text("revision_number").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  originalFileName: text("original_file_name").notNull().default("file"),
  storageDiskPath: text("storage_disk_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tagsTable = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  description: text("description"),
});

export const documentTagsTable = pgTable("document_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  tagId: varchar("tag_id").notNull(),
});

export const userGroupPermissionsTable = pgTable("user_group_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  groupId: varchar("group_id").notNull(),
});

export const logsTable = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  documentId: varchar("document_id"),
  revisionId: varchar("revision_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  device: text("device"),
});

export const revokedTokensTable = pgTable("revoked_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  userId: varchar("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at").notNull().defaultNow(),
});

export const employeesTable = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  operatorId: text("operator_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const nfcTagsTable = pgTable("nfc_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  nfcCode: text("nfc_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeeDocumentPermissionsTable = pgTable("employee_document_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  documentId: varchar("document_id").notNull(),
  grantedUntil: timestamp("granted_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeeCategoryPermissionsTable = pgTable("employee_category_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  grantedUntil: timestamp("granted_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appUserAccessTable = pgTable("app_user_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  groupId: varchar("group_id").notNull(),
  accessUntil: timestamp("access_until").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appAccessLogsTable = pgTable("app_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  rfidTagSnapshot: text("rfid_tag_snapshot").notNull(),
  groupId: varchar("group_id"),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  device: text("device"),
  source: text("source").notNull().default("app"),
});

export const appSourceEmployeesTable = pgTable("app_source_employees", {
  id: varchar("id").primaryKey(),
  fullName: text("full_name").notNull(),
  operatorId: text("operator_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
});

export const appSourceNfcTagsTable = pgTable("app_source_nfc_tags", {
  id: varchar("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  nfcCode: text("nfc_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
});

export const appSourceDocumentsTable = pgTable("app_source_documents", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  viewerUrl: text("viewer_url").notNull(),
  fileType: text("file_type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
});

export const appSourceEmployeeDocumentPermissionsTable = pgTable("app_source_employee_document_permissions", {
  id: varchar("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  documentId: varchar("document_id").notNull(),
  grantedUntil: timestamp("granted_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
});

export const countersTable = pgTable("counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scope: text("scope").notNull().unique(),
  currentValue: integer("current_value").notNull().default(0),
});
