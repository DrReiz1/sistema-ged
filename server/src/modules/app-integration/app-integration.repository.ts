import { eq } from "drizzle-orm";
import { db } from "../../shared/database/client";
import {
  memoryDb,
  nextMemoryId,
  type AppAccessLogRecord,
  type EmployeeDocumentPermissionRecord,
  type EmployeeRecord,
  type NfcTagRecord,
} from "../../shared/database/memory";
import {
  appSourceDocumentsTable,
  appSourceEmployeeDocumentPermissionsTable,
  appSourceEmployeesTable,
  appSourceNfcTagsTable,
  appAccessLogsTable,
  employeeCategoryPermissionsTable,
  employeeDocumentPermissionsTable,
  employeesTable,
  nfcTagsTable,
} from "../../shared/database/schema";
import type {
  AppSourceDocumentInput,
  AppSourceEmployeeDocumentPermissionInput,
  AppSourceEmployeeInput,
  AppSourceNfcTagInput,
} from "./app-integration.types";

class AppIntegrationRepository {
  async listEmployees() {
    if (db) {
      const rows = await db.select().from(employeesTable);
      memoryDb.employees = rows.map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt),
      }));
    }

    return [...memoryDb.employees];
  }

  async findEmployeeById(employeeId: string) {
    const cached = memoryDb.employees.find((item) => item.id === employeeId) ?? null;
    if (cached || !db) {
      return cached;
    }

    const row = await db.select().from(employeesTable).where(eq(employeesTable.id, employeeId)).limit(1);
    const employee = row[0]
      ? {
          ...row[0],
          createdAt: new Date(row[0].createdAt),
        }
      : null;

    if (employee) {
      memoryDb.employees.push(employee);
    }

    return employee;
  }

  async upsertEmployee(employee: EmployeeRecord) {
    const existing = memoryDb.employees.find((item) => item.id === employee.id) ?? null;

    if (existing) {
      Object.assign(existing, employee);
      if (db) {
        await db.update(employeesTable)
          .set({
            fullName: employee.fullName,
            operatorId: employee.operatorId,
            isActive: employee.isActive,
          })
          .where(eq(employeesTable.id, employee.id));
      }
      return existing;
    }

    memoryDb.employees.push(employee);
    if (db) {
      await db.insert(employeesTable).values(employee);
    }
    return employee;
  }

  async listNfcTags(employeeId?: string) {
    if (db) {
      const rows = employeeId
        ? await db.select().from(nfcTagsTable).where(eq(nfcTagsTable.employeeId, employeeId))
        : await db.select().from(nfcTagsTable);

      const normalizedRows = rows.map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt),
      }));

      if (employeeId) {
        memoryDb.nfcTags = [
          ...memoryDb.nfcTags.filter((item) => item.employeeId !== employeeId),
          ...normalizedRows,
        ];
      } else {
        memoryDb.nfcTags = normalizedRows;
      }
    }

    const tags = employeeId
      ? memoryDb.nfcTags.filter((item) => item.employeeId === employeeId)
      : memoryDb.nfcTags;

    return [...tags].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  async replaceEmployeeNfcTag(employeeId: string, nfcCode: string | null, isActive: boolean) {
    const normalizedNfcCode = nfcCode?.trim() || null;
    const currentTags = memoryDb.nfcTags.filter((item) => item.employeeId === employeeId);

    if (db) {
      for (const tag of currentTags) {
        await db.update(nfcTagsTable)
          .set({ isActive: false })
          .where(eq(nfcTagsTable.id, tag.id));
      }
    }

    currentTags.forEach((tag) => {
      tag.isActive = false;
    });

    if (!normalizedNfcCode) {
      return null;
    }

    const existingByCode = memoryDb.nfcTags.find((item) => item.nfcCode.trim() === normalizedNfcCode) ?? null;
    if (existingByCode) {
      existingByCode.employeeId = employeeId;
      existingByCode.nfcCode = normalizedNfcCode;
      existingByCode.isActive = isActive;

      if (db) {
        await db.update(nfcTagsTable)
          .set({
            employeeId,
            nfcCode: normalizedNfcCode,
            isActive,
          })
          .where(eq(nfcTagsTable.id, existingByCode.id));
      }

      return existingByCode;
    }

    const tagRow: NfcTagRecord = {
      id: nextMemoryId(),
      employeeId,
      nfcCode: normalizedNfcCode,
      isActive,
      createdAt: new Date(),
    };

    memoryDb.nfcTags.push(tagRow);
    if (db) {
      await db.insert(nfcTagsTable).values(tagRow);
    }
    return tagRow;
  }

  async findActiveNfcTag(nfcCode: string) {
    const normalizedNfcCode = nfcCode.trim();
    const cached = memoryDb.nfcTags.find((item) => item.nfcCode.trim() === normalizedNfcCode && item.isActive) ?? null;
    if (cached || !db) {
      return cached;
    }

    const row = await db.select().from(nfcTagsTable).where(eq(nfcTagsTable.nfcCode, normalizedNfcCode)).limit(1);
    const tag = row[0]
      ? {
          ...row[0],
          createdAt: new Date(row[0].createdAt),
        }
      : null;

    if (tag) {
      const existingIndex = memoryDb.nfcTags.findIndex((item) => item.id === tag.id);
      if (existingIndex >= 0) {
        memoryDb.nfcTags[existingIndex] = tag;
      } else {
        memoryDb.nfcTags.push(tag);
      }
    }

    return tag?.isActive ? tag : null;
  }

  async listEmployeeDocumentPermissions(employeeId?: string) {
    if (db) {
      const rows = employeeId
        ? await db.select().from(employeeDocumentPermissionsTable).where(eq(employeeDocumentPermissionsTable.employeeId, employeeId))
        : await db.select().from(employeeDocumentPermissionsTable);

      const normalizedRows = rows.map((row) => ({
        ...row,
        grantedUntil: row.grantedUntil ? new Date(row.grantedUntil) : null,
        createdAt: new Date(row.createdAt),
      }));

      if (employeeId) {
        memoryDb.employeeDocumentPermissions = [
          ...memoryDb.employeeDocumentPermissions.filter((item) => item.employeeId !== employeeId),
          ...normalizedRows,
        ];
      } else {
        memoryDb.employeeDocumentPermissions = normalizedRows;
      }
    }

    const permissions = employeeId
      ? memoryDb.employeeDocumentPermissions.filter((item) => item.employeeId === employeeId)
      : memoryDb.employeeDocumentPermissions;

    return [...permissions].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  async listEmployeeCategoryPermissions(employeeId?: string) {
    if (db) {
      const rows = employeeId
        ? await db.select().from(employeeCategoryPermissionsTable).where(eq(employeeCategoryPermissionsTable.employeeId, employeeId))
        : await db.select().from(employeeCategoryPermissionsTable);

      const normalizedRows = rows.map((row) => ({
        ...row,
        grantedUntil: row.grantedUntil ? new Date(row.grantedUntil) : null,
        createdAt: new Date(row.createdAt),
      }));

      if (employeeId) {
        memoryDb.employeeCategoryPermissions = [
          ...memoryDb.employeeCategoryPermissions.filter((item) => item.employeeId !== employeeId),
          ...normalizedRows,
        ];
      } else {
        memoryDb.employeeCategoryPermissions = normalizedRows;
      }
    }

    const permissions = employeeId
      ? memoryDb.employeeCategoryPermissions.filter((item) => item.employeeId === employeeId)
      : memoryDb.employeeCategoryPermissions;

    return [...permissions].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  async syncEmployeeDocumentPermissions(
    employeeId: string,
    documentIds: string[],
    input: { grantedUntil: Date | null; isActive: boolean },
  ) {
    const current = memoryDb.employeeDocumentPermissions.filter((item) => item.employeeId === employeeId);
    const selected = new Set(documentIds);

    for (const permission of current) {
      const shouldBeActive = selected.has(permission.documentId) && input.isActive;
      permission.isActive = shouldBeActive;
      permission.grantedUntil = selected.has(permission.documentId) ? input.grantedUntil : permission.grantedUntil;

      if (db) {
        await db.update(employeeDocumentPermissionsTable)
          .set({
            isActive: permission.isActive,
            grantedUntil: permission.grantedUntil,
          })
          .where(eq(employeeDocumentPermissionsTable.id, permission.id));
      }
    }

    const existingDocumentIds = new Set(current.map((item) => item.documentId));
    const inserted: EmployeeDocumentPermissionRecord[] = [];

    for (const documentId of documentIds) {
      if (existingDocumentIds.has(documentId)) {
        continue;
      }

      const row: EmployeeDocumentPermissionRecord = {
        id: nextMemoryId(),
        employeeId,
        documentId,
        grantedUntil: input.grantedUntil,
        isActive: input.isActive,
        createdAt: new Date(),
      };

      inserted.push(row);
      memoryDb.employeeDocumentPermissions.push(row);

      if (db) {
        await db.insert(employeeDocumentPermissionsTable).values(row);
      }
    }

    return [
      ...current,
      ...inserted,
    ];
  }

  async syncEmployeeCategoryPermissions(
    employeeId: string,
    categoryIds: string[],
    input: { grantedUntil: Date | null; isActive: boolean },
  ) {
    const current = memoryDb.employeeCategoryPermissions.filter((item) => item.employeeId === employeeId);
    const selected = new Set(categoryIds);

    for (const permission of current) {
      const shouldBeActive = selected.has(permission.categoryId) && input.isActive;
      permission.isActive = shouldBeActive;
      permission.grantedUntil = selected.has(permission.categoryId) ? input.grantedUntil : permission.grantedUntil;

      if (db) {
        await db.update(employeeCategoryPermissionsTable)
          .set({
            isActive: permission.isActive,
            grantedUntil: permission.grantedUntil,
          })
          .where(eq(employeeCategoryPermissionsTable.id, permission.id));
      }
    }

    const existingCategoryIds = new Set(current.map((item) => item.categoryId));

    for (const categoryId of categoryIds) {
      if (existingCategoryIds.has(categoryId)) {
        continue;
      }

      const row = {
        id: nextMemoryId(),
        employeeId,
        categoryId,
        grantedUntil: input.grantedUntil,
        isActive: input.isActive,
        createdAt: new Date(),
      };

      memoryDb.employeeCategoryPermissions.push(row);
      if (db) {
        await db.insert(employeeCategoryPermissionsTable).values(row);
      }
    }

    return this.listEmployeeCategoryPermissions(employeeId);
  }

  async listAppLogs() {
    if (db) {
      const rows = await db.select().from(appAccessLogsTable);
      memoryDb.appAccessLogs = rows.map((row) => ({
        ...row,
        groupId: row.groupId ?? null,
        documentId: row.documentId ?? null,
        ipAddress: row.ipAddress ?? null,
        device: row.device ?? null,
        source: "app",
        timestamp: new Date(row.timestamp),
      }));
    }

    return [...memoryDb.appAccessLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAppLog(
    input: Omit<AppAccessLogRecord, "id" | "timestamp" | "source" | "groupId" | "documentId"> & {
      timestamp?: Date;
      groupId?: string | null;
      documentId?: string | null;
    },
  ) {
    const log = {
      id: nextMemoryId(),
      source: "app" as const,
      timestamp: input.timestamp ?? new Date(),
      groupId: input.groupId ?? null,
      documentId: input.documentId ?? null,
      ...input,
    };

    if (db) {
      await db.insert(appAccessLogsTable).values(log);
    }

    memoryDb.appAccessLogs.push(log);
    return log;
  }

  async replaceAppSourceSnapshot(input: {
    employees: AppSourceEmployeeInput[];
    nfcTags: AppSourceNfcTagInput[];
    documents: AppSourceDocumentInput[];
    permissions: AppSourceEmployeeDocumentPermissionInput[];
  }) {
    memoryDb.appSourceEmployees = input.employees.map((item) => ({ ...item }));
    memoryDb.appSourceNfcTags = input.nfcTags.map((item) => ({ ...item }));
    memoryDb.appSourceDocuments = input.documents.map((item) => ({ ...item }));
    memoryDb.appSourceEmployeeDocumentPermissions = input.permissions.map((item) => ({ ...item }));

    if (!db) {
      return;
    }

    await db.delete(appSourceEmployeeDocumentPermissionsTable);
    await db.delete(appSourceNfcTagsTable);
    await db.delete(appSourceDocumentsTable);
    await db.delete(appSourceEmployeesTable);

    if (input.employees.length > 0) {
      await db.insert(appSourceEmployeesTable).values(input.employees);
    }

    if (input.nfcTags.length > 0) {
      await db.insert(appSourceNfcTagsTable).values(input.nfcTags);
    }

    if (input.documents.length > 0) {
      await db.insert(appSourceDocumentsTable).values(input.documents);
    }

    if (input.permissions.length > 0) {
      await db.insert(appSourceEmployeeDocumentPermissionsTable).values(input.permissions);
    }
  }
}

export const appIntegrationRepository = new AppIntegrationRepository();
