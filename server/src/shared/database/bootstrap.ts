import { db } from "./client";
import {
  categoriesTable,
  countersTable,
  documentTagsTable,
  documentsTable,
  groupsTable,
  logsTable,
  revisionsTable,
  tagsTable,
  userGroupPermissionsTable,
  usersTable,
} from "./schema";
import { clearMemoryDatabase, memoryDb, nextMemoryId } from "./memory";
import type { UserRole } from "../types/auth.types";
import type { DocumentStatus } from "../types/common.types";
import { hashPassword } from "../utils/crypto";
import { getPermissionsByRole } from "../utils/role-permissions";
import { generateDocumentCode } from "../utils/document-code";
import { generateRevisionNumber } from "../utils/revision";
import { buildStoragePath } from "../utils/storage-path";

async function seedMemoryDatabase(): Promise<void> {
  const categoryDrt = {
    id: nextMemoryId(),
    name: "Desenho de Transformador",
    prefix: "DRT",
    description: "Documentação técnica de transformadores",
  };

  const categoryPit = {
    id: nextMemoryId(),
    name: "Procedimento de Montagem",
    prefix: "PIT",
    description: "Procedimentos operacionais de montagem",
  };

  memoryDb.categories.push(categoryDrt, categoryPit);

  const groupSe01 = {
    id: nextMemoryId(),
    name: "Montagem de Transformadores",
    description: "Equipe responsável por montagem e inspeção de transformadores",
  };

  const groupPainel = {
    id: nextMemoryId(),
    name: "Montagem de Reguladores",
    description: "Equipe responsável por reguladores e conjuntos associados",
  };

  const groupBobinagem = {
    id: nextMemoryId(),
    name: "Bobinagem e Núcleo",
    description: "Equipe responsável por bobinagem, núcleo e preparação do conjunto magnético",
  };

  memoryDb.groups.push(groupSe01, groupPainel, groupBobinagem);

  memoryDb.tags.push(
    { id: nextMemoryId(), name: "Critico", color: "#ef4444", description: "Documento crítico" },
    { id: nextMemoryId(), name: "Montagem", color: "#f97316", description: "Uso em montagem" },
    { id: nextMemoryId(), name: "Qualidade", color: "#0ea5e9", description: "Uso em qualidade" },
  );

  const adminPasswordHash = await hashPassword("tsea@2024");
  const supervisorPasswordHash = await hashPassword("tsea@2024");
  const operatorPasswordHash = await hashPassword("tsea@2024");

  const adminUser = {
    id: nextMemoryId(),
    name: "Administrador GED",
    email: "admin@tsea.com.br",
    passwordHash: adminPasswordHash,
    role: "admin" as const,
    rfidTag: "RFID-ADMIN-001",
    sector: "Engenharia Documental",
    active: true,
    createdAt: new Date(),
  };

  const supervisorUser = {
    id: nextMemoryId(),
    name: "Marcos",
    email: "supervisor@tsea.com.br",
    passwordHash: supervisorPasswordHash,
    role: "supervisor" as const,
    rfidTag: "RFID-SUP-001",
    sector: "Transformadores",
    active: true,
    createdAt: new Date(),
  };

  const operatorUser = {
    id: nextMemoryId(),
    name: "Operador Linha 01",
    email: "operador@tsea.com.br",
    passwordHash: operatorPasswordHash,
    role: "operator" as const,
    rfidTag: "RFID-OP-001",
    sector: "Transformadores",
    active: true,
    createdAt: new Date(),
  };

  memoryDb.users.push(adminUser, supervisorUser, operatorUser);

  memoryDb.userGroupPermissions.push(
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupSe01.id },
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupPainel.id },
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupBobinagem.id },
    { id: nextMemoryId(), userId: supervisorUser.id, groupId: groupSe01.id },
    { id: nextMemoryId(), userId: supervisorUser.id, groupId: groupBobinagem.id },
    { id: nextMemoryId(), userId: operatorUser.id, groupId: groupSe01.id },
  );

  memoryDb.counters.push(
    { id: nextMemoryId(), scope: "category:DRT", currentValue: 1 },
    { id: nextMemoryId(), scope: "document-revision", currentValue: 1 },
  );

  const documentId = nextMemoryId();
  const revisionId = nextMemoryId();
  const documentCode = generateDocumentCode(categoryDrt.prefix, 1);
  const revisionNumber = generateRevisionNumber(1);

  memoryDb.documents.push({
    id: documentId,
    code: documentCode,
    title: "Desenho principal do transformador",
    description: "Documento mestre do conjunto de transformador industrial",
    categoryId: categoryDrt.id,
    groupId: groupSe01.id,
    currentRevisionId: revisionId,
    status: "active",
    createdAt: new Date(),
  });

  memoryDb.revisions.push({
    id: revisionId,
    documentId,
    revisionNumber,
    fileUrl: buildStoragePath(categoryDrt.prefix, documentCode, revisionNumber, "pdf"),
    fileType: "pdf",
    uploadedBy: adminUser.id,
    originalFileName: "DRT-001_REV01.pdf",
    storageDiskPath: null,
    createdAt: new Date(),
  });

  memoryDb.documentTags.push({
    id: nextMemoryId(),
    documentId,
    tagId: memoryDb.tags[1].id,
  });

  memoryDb.logs.push({
    id: nextMemoryId(),
    userId: adminUser.id,
    action: "bootstrap",
    documentId,
    revisionId,
    timestamp: new Date(),
    ipAddress: "127.0.0.1",
    device: "seed-script",
  });
}

async function hydrateMemoryFromDatabase() {
  if (!db) {
    return;
  }

  clearMemoryDatabase();

  const [
    users,
    categories,
    groups,
    documents,
    revisions,
    tags,
    documentTags,
    userGroupPermissions,
    logs,
    counters,
  ] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(categoriesTable),
    db.select().from(groupsTable),
    db.select().from(documentsTable),
    db.select().from(revisionsTable),
    db.select().from(tagsTable),
    db.select().from(documentTagsTable),
    db.select().from(userGroupPermissionsTable),
    db.select().from(logsTable),
    db.select().from(countersTable),
  ]);

  memoryDb.users = users.map((row) => ({
    ...row,
    role: row.role as UserRole,
    rfidTag: row.rfidTag ?? null,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.categories = categories.map((row) => ({ ...row, description: row.description ?? null }));
  memoryDb.groups = groups.map((row) => ({ ...row, description: row.description ?? null }));
  memoryDb.documents = documents.map((row) => ({
    ...row,
    status: row.status as DocumentStatus,
    description: row.description ?? null,
    currentRevisionId: row.currentRevisionId ?? null,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.revisions = revisions.map((row) => ({
    ...row,
    storageDiskPath: row.storageDiskPath ?? null,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.tags = tags.map((row) => ({ ...row, description: row.description ?? null }));
  memoryDb.documentTags = documentTags;
  memoryDb.userGroupPermissions = userGroupPermissions;
  memoryDb.logs = logs.map((row) => ({
    ...row,
    documentId: row.documentId ?? null,
    revisionId: row.revisionId ?? null,
    ipAddress: row.ipAddress ?? null,
    device: row.device ?? null,
    timestamp: new Date(row.timestamp),
  }));
  memoryDb.counters = counters;
}

async function persistSeedToDatabase() {
  if (!db) {
    return;
  }

  await db.insert(categoriesTable).values(memoryDb.categories);
  await db.insert(groupsTable).values(memoryDb.groups);
  await db.insert(tagsTable).values(memoryDb.tags);
  await db.insert(usersTable).values(memoryDb.users);
  await db.insert(userGroupPermissionsTable).values(memoryDb.userGroupPermissions);
  await db.insert(countersTable).values(memoryDb.counters);
  await db.insert(documentsTable).values(memoryDb.documents);
  await db.insert(revisionsTable).values(memoryDb.revisions);
  await db.insert(documentTagsTable).values(memoryDb.documentTags);
  await db.insert(logsTable).values(memoryDb.logs);
}

export async function bootstrapMemoryDatabase(): Promise<void> {
  if (!db) {
    clearMemoryDatabase();
    await seedMemoryDatabase();

    console.log("[docstation-api] memory bootstrap complete", {
      users: memoryDb.users.length,
      groups: memoryDb.groups.length,
      permissionsSeeded: getPermissionsByRole("admin").length,
      persistence: "memory",
    });
    return;
  }

  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length === 0) {
    clearMemoryDatabase();
    await seedMemoryDatabase();
    await persistSeedToDatabase();
  }

  await hydrateMemoryFromDatabase();

  console.log("[docstation-api] database bootstrap complete", {
    users: memoryDb.users.length,
    groups: memoryDb.groups.length,
    permissionsSeeded: getPermissionsByRole("admin").length,
    persistence: "postgres",
  });
}
