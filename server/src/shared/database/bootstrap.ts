import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import {
  appAccessLogsTable,
  appUserAccessTable,
  categoriesTable,
  countersTable,
  employeeCategoryPermissionsTable,
  employeeDocumentPermissionsTable,
  employeesTable,
  documentTagsTable,
  documentsTable,
  groupsTable,
  logsTable,
  nfcTagsTable,
  revokedTokensTable,
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

async function ensureAppRpcContracts() {
  if (!db) {
    return;
  }

  await db.execute(sql`create extension if not exists "pgcrypto";`);

  await db.execute(sql`
    create or replace function public.app_authorize_nfc(p_nfc_code text)
    returns table (
      employee_id uuid,
      employee_name text,
      operator_id text
    )
    language sql
    security definer
    set search_path = public
    as $$
      select
        e.id::uuid as employee_id,
        e.full_name as employee_name,
        e.operator_id
      from public.nfc_tags t
      join public.employees e on e.id = t.employee_id
      where t.nfc_code = p_nfc_code
        and t.is_active = true
        and e.is_active = true
      limit 1
    $$;
  `);

  await db.execute(sql`grant execute on function public.app_authorize_nfc(text) to anon, authenticated;`);

  await db.execute(sql`
    create or replace function public.app_get_documents_for_employee(p_employee_id uuid)
    returns table (
      document_id uuid,
      title text,
      description text,
      viewer_url text,
      file_type text,
      is_active boolean
    )
    language sql
    security definer
    set search_path = public
    as $$
      select
        d.id::uuid as document_id,
        d.title,
        coalesce(d.description, '') as description,
        regexp_replace(r.file_url, '^documents/', '') as viewer_url,
        coalesce(r.file_type, 'unknown') as file_type,
        (d.status = 'active') as is_active
      from public.employee_category_permissions p
      join public.documents d on d.category_id = p.category_id
      left join public.document_revisions r on r.id = d.current_revision_id
      join public.employees e on e.id = p.employee_id
      where p.employee_id = p_employee_id::text
        and p.is_active = true
        and e.is_active = true
        and d.status = 'active'
        and r.id is not null
        and (p.granted_until is null or p.granted_until >= now())
      order by d.title asc
    $$;
  `);

  await db.execute(sql`grant execute on function public.app_get_documents_for_employee(uuid) to anon, authenticated;`);
}

async function syncEmployeesProjection() {
  if (!db) {
    return;
  }

  for (const user of memoryDb.users) {
    const employee = memoryDb.employees.find((item) => item.id === user.id);
    const employeePayload = {
      id: user.id,
      fullName: user.name,
      operatorId: user.operatorId,
      isActive: employee?.isActive ?? user.active,
      createdAt: employee?.createdAt ?? user.createdAt,
    };

    if (employee) {
      Object.assign(employee, employeePayload);
      await db.update(employeesTable)
        .set({
          fullName: employeePayload.fullName,
          operatorId: employeePayload.operatorId,
          isActive: employeePayload.isActive,
        })
        .where(eq(employeesTable.id, user.id));
    } else {
      memoryDb.employees.push(employeePayload);
      await db.insert(employeesTable).values(employeePayload);
    }

    if (!user.rfidTag) {
      continue;
    }

    const existingTag = memoryDb.nfcTags.find((item) => item.employeeId === user.id && item.nfcCode === user.rfidTag);
    if (existingTag) {
      continue;
    }

    const tagRow = {
      id: nextMemoryId(),
      employeeId: user.id,
      nfcCode: user.rfidTag,
      isActive: true,
      createdAt: user.createdAt,
    };

    memoryDb.nfcTags.push(tagRow);
    await db.insert(nfcTagsTable).values(tagRow).onConflictDoNothing();
  }
}

async function seedMemoryDatabase(): Promise<void> {
  const defaultAppAccessUntil = new Date("2099-12-31T23:59:59.000Z");

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
    operatorId: "ADM-001",
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
    operatorId: "SUP-001",
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
    operatorId: "OPE-001",
    rfidTag: "RFID-OP-001",
    sector: "Transformadores",
    active: true,
    createdAt: new Date(),
  };

  memoryDb.users.push(adminUser, supervisorUser, operatorUser);
  memoryDb.employees.push(
    {
      id: adminUser.id,
      fullName: adminUser.name,
      operatorId: adminUser.operatorId,
      isActive: true,
      createdAt: adminUser.createdAt,
    },
    {
      id: supervisorUser.id,
      fullName: supervisorUser.name,
      operatorId: supervisorUser.operatorId,
      isActive: true,
      createdAt: supervisorUser.createdAt,
    },
    {
      id: operatorUser.id,
      fullName: operatorUser.name,
      operatorId: operatorUser.operatorId,
      isActive: true,
      createdAt: operatorUser.createdAt,
    },
  );
  memoryDb.nfcTags.push(
    {
      id: nextMemoryId(),
      employeeId: adminUser.id,
      nfcCode: adminUser.rfidTag!,
      isActive: true,
      createdAt: adminUser.createdAt,
    },
    {
      id: nextMemoryId(),
      employeeId: supervisorUser.id,
      nfcCode: supervisorUser.rfidTag!,
      isActive: true,
      createdAt: supervisorUser.createdAt,
    },
    {
      id: nextMemoryId(),
      employeeId: operatorUser.id,
      nfcCode: operatorUser.rfidTag!,
      isActive: true,
      createdAt: operatorUser.createdAt,
    },
  );

  memoryDb.userGroupPermissions.push(
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupSe01.id },
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupPainel.id },
    { id: nextMemoryId(), userId: adminUser.id, groupId: groupBobinagem.id },
    { id: nextMemoryId(), userId: supervisorUser.id, groupId: groupSe01.id },
    { id: nextMemoryId(), userId: supervisorUser.id, groupId: groupBobinagem.id },
    { id: nextMemoryId(), userId: operatorUser.id, groupId: groupSe01.id },
  );

  memoryDb.appUserAccess.push(
    {
      id: nextMemoryId(),
      userId: supervisorUser.id,
      groupId: groupSe01.id,
      accessUntil: defaultAppAccessUntil,
      enabled: true,
      createdAt: new Date(),
    },
    {
      id: nextMemoryId(),
      userId: supervisorUser.id,
      groupId: groupBobinagem.id,
      accessUntil: defaultAppAccessUntil,
      enabled: true,
      createdAt: new Date(),
    },
    {
      id: nextMemoryId(),
      userId: operatorUser.id,
      groupId: groupSe01.id,
      accessUntil: defaultAppAccessUntil,
      enabled: true,
      createdAt: new Date(),
    },
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
  memoryDb.employeeDocumentPermissions.push(
    {
      id: nextMemoryId(),
      employeeId: supervisorUser.id,
      documentId,
      grantedUntil: defaultAppAccessUntil,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: nextMemoryId(),
      employeeId: operatorUser.id,
      documentId,
      grantedUntil: defaultAppAccessUntil,
      isActive: true,
      createdAt: new Date(),
    },
  );
  memoryDb.employeeCategoryPermissions.push(
    {
      id: nextMemoryId(),
      employeeId: supervisorUser.id,
      categoryId: categoryDrt.id,
      grantedUntil: defaultAppAccessUntil,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: nextMemoryId(),
      employeeId: operatorUser.id,
      categoryId: categoryDrt.id,
      grantedUntil: defaultAppAccessUntil,
      isActive: true,
      createdAt: new Date(),
    },
  );

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
    revokedTokens,
    employees,
    nfcTags,
    employeeDocumentPermissions,
    employeeCategoryPermissions,
    appUserAccess,
    appAccessLogs,
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
    db.select().from(revokedTokensTable).catch(() => []),
    db.select().from(employeesTable),
    db.select().from(nfcTagsTable),
    db.select().from(employeeDocumentPermissionsTable),
    db.select().from(employeeCategoryPermissionsTable),
    db.select().from(appUserAccessTable),
    db.select().from(appAccessLogsTable),
    db.select().from(countersTable),
  ]);

  const usersMissingOperatorId = users.filter((row) => !row.operatorId);
  if (db && usersMissingOperatorId.length > 0) {
    const database = db;
    await Promise.all(
      usersMissingOperatorId.map((row, index) => {
        const generatedOperatorId = `OP-${String(index + 1).padStart(3, "0")}-${row.id.slice(0, 4).toUpperCase()}`;
        return database.update(usersTable)
          .set({ operatorId: generatedOperatorId })
          .where(eq(usersTable.id, row.id));
      }),
    );
  }

  const normalizedUsers = users.map((row, index) => ({
    ...row,
    operatorId: row.operatorId ?? `OP-${String(index + 1).padStart(3, "0")}-${row.id.slice(0, 4).toUpperCase()}`,
  }));

  memoryDb.users = normalizedUsers.map((row) => ({
    ...row,
    role: row.role as UserRole,
    operatorId: row.operatorId,
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
  memoryDb.revokedTokens = revokedTokens.map((row) => ({
    ...row,
    expiresAt: new Date(row.expiresAt),
    revokedAt: new Date(row.revokedAt),
  }));
  memoryDb.employees = employees.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.nfcTags = nfcTags.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.employeeDocumentPermissions = employeeDocumentPermissions.map((row) => ({
    ...row,
    grantedUntil: row.grantedUntil ? new Date(row.grantedUntil) : null,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.employeeCategoryPermissions = employeeCategoryPermissions.map((row) => ({
    ...row,
    grantedUntil: row.grantedUntil ? new Date(row.grantedUntil) : null,
    createdAt: new Date(row.createdAt),
  }));
  memoryDb.appUserAccess = appUserAccess.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
    accessUntil: new Date(row.accessUntil),
  }));
  memoryDb.appAccessLogs = appAccessLogs.map((row) => ({
    ...row,
    groupId: row.groupId ?? null,
    ipAddress: row.ipAddress ?? null,
    device: row.device ?? null,
    source: "app",
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
  await db.insert(employeesTable).values(memoryDb.employees);
  await db.insert(nfcTagsTable).values(memoryDb.nfcTags);
  await db.insert(userGroupPermissionsTable).values(memoryDb.userGroupPermissions);
  await db.insert(employeeDocumentPermissionsTable).values(memoryDb.employeeDocumentPermissions);
  await db.insert(employeeCategoryPermissionsTable).values(memoryDb.employeeCategoryPermissions);
  await db.insert(appUserAccessTable).values(memoryDb.appUserAccess);
  await db.insert(countersTable).values(memoryDb.counters);
  await db.insert(documentsTable).values(memoryDb.documents);
  await db.insert(revisionsTable).values(memoryDb.revisions);
  await db.insert(documentTagsTable).values(memoryDb.documentTags);
  await db.insert(logsTable).values(memoryDb.logs);
  await db.insert(appAccessLogsTable).values(memoryDb.appAccessLogs);
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
  await syncEmployeesProjection();
  await ensureAppRpcContracts();
  await hydrateMemoryFromDatabase();

  console.log("[docstation-api] database bootstrap complete", {
    users: memoryDb.users.length,
    groups: memoryDb.groups.length,
    permissionsSeeded: getPermissionsByRole("admin").length,
    persistence: "postgres",
  });
}
