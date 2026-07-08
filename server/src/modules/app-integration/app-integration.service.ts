import { AppError } from "../../shared/errors/app-error";
import { appSourceDb, appSourceSupabase } from "../../shared/database/app-source-client";
import { memoryDb } from "../../shared/database/memory";
import { normalizeStoragePath } from "../../shared/utils/storage-path";
import { documentService } from "../documents/documents.service";
import { logRepository } from "../logs/logs.repository";
import { userRepository } from "../users/users.repository";
import { appIntegrationRepository } from "./app-integration.repository";
import type { CreateAppLogInput, SyncAppUserAccessInput, ValidateBadgeInput } from "./app-integration.types";

class AppIntegrationService {
  async listUsers() {
    const users = await userRepository.list();
    return Promise.all(
      users.map(async ({ passwordHash: _passwordHash, ...user }) => ({
        id: user.id,
        name: user.name,
        operatorId: user.operatorId,
        active: user.active,
        sector: user.sector,
        appProfile: await this.hydrateUserAppProfile(user.id),
        appAccess: await this.hydrateUserAppAccess(user.id),
      })),
    );
  }

  async syncUserAccess(input: SyncAppUserAccessInput, actorUserId: string) {
    const normalizedNfcCode = input.nfcCode?.trim() || null;
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    for (const categoryId of input.categoryIds) {
      const category = memoryDb.categories.find((item) => item.id === categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (normalizedNfcCode) {
      const tagOwner = memoryDb.nfcTags.find((item) => item.nfcCode.trim() === normalizedNfcCode && item.employeeId !== input.userId);
      if (tagOwner) {
        throw new AppError("NFC tag already assigned to another employee", 409);
      }
    }

    await userRepository.updateAppIdentity(user.id, {
      operatorId: user.operatorId,
      rfidTag: normalizedNfcCode,
    });

    await appIntegrationRepository.upsertEmployee({
      id: user.id,
      fullName: user.name,
      operatorId: user.operatorId,
      isActive: input.employeeActive,
      createdAt: user.createdAt,
    });

    await appIntegrationRepository.replaceEmployeeNfcTag(user.id, normalizedNfcCode, input.nfcActive);
    await logRepository.create({
      userId: actorUserId,
      action: "alteracao_permissao",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    await appIntegrationRepository.syncEmployeeCategoryPermissions(user.id, input.categoryIds, {
      grantedUntil: input.accessUntil,
      isActive: input.enabled,
    });

    return this.hydrateUserAppAccess(user.id);
  }

  async validateBadge(input: ValidateBadgeInput, meta: { ipAddress?: string; device?: string }) {
    const normalizedRfidTag = input.rfidTag.trim();
    const tag = await appIntegrationRepository.findActiveNfcTag(normalizedRfidTag);
    const employee = tag ? await appIntegrationRepository.findEmployeeById(tag.employeeId) : null;

    if (!tag || !employee || !employee.isActive) {
      const knownUser = await userRepository.findByRfidTag(normalizedRfidTag);
      if (knownUser) {
        await appIntegrationRepository.createAppLog({
          userId: knownUser.id,
          rfidTagSnapshot: normalizedRfidTag,
          action: "app_access_denied",
          ipAddress: meta.ipAddress ?? null,
          device: meta.device ?? null,
        });
      }

      throw new AppError("RFID not recognized", 401);
    }

    await appIntegrationRepository.createAppLog({
      userId: employee.id,
      rfidTagSnapshot: normalizedRfidTag,
      action: "app_access_granted",
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });

    return {
      userId: employee.id,
      name: employee.fullName,
      operatorId: employee.operatorId,
    };
  }

  async listDocumentsForUser(userId: string) {
    const employee = await appIntegrationRepository.findEmployeeById(userId);
    if (!employee || !employee.isActive) {
      throw new AppError("Employee not found", 404);
    }

    const activePermissions = await this.getActiveCategoryPermissions(userId);
    const categoryIds = new Set(activePermissions.map((entry) => entry.categoryId));
    const documents = await Promise.all(
      memoryDb.documents
        .filter((document) => document.status === "active" && categoryIds.has(document.categoryId))
        .map(async (document) => {
          const hydrated = await documentService.getForApp(document.id);
          return {
            documentId: hydrated.id,
            title: hydrated.title,
            description: hydrated.description ?? "",
            viewerUrl: hydrated.currentRevision?.fileUrl ? normalizeStoragePath(hydrated.currentRevision.fileUrl) : "",
            fileType: hydrated.currentRevision?.fileType ?? "unknown",
            isActive: hydrated.status === "active",
          };
        }),
    );

    await appIntegrationRepository.createAppLog({
      userId: employee.id,
      rfidTagSnapshot: this.getCurrentNfcCode(employee.id) ?? "unknown",
      action: "app_documents_viewed",
      documentId: null,
      ipAddress: null,
      device: null,
    });

    return documents.filter((item) => item.viewerUrl);
  }

  async createAppLog(input: CreateAppLogInput) {
    const employee = await appIntegrationRepository.findEmployeeById(input.userId);
    if (!employee) {
      throw new AppError("User not found", 404);
    }

    const document = input.documentId
      ? memoryDb.documents.find((item) => item.id === input.documentId) ?? null
      : null;

    return appIntegrationRepository.createAppLog({
      userId: input.userId,
      rfidTagSnapshot: this.getCurrentNfcCode(input.userId) ?? "unknown",
      groupId: document?.groupId ?? null,
      documentId: input.documentId ?? null,
      action: input.action,
      ipAddress: input.ipAddress ?? null,
      device: input.device ?? null,
    });
  }

  async importSourceSnapshot(actorUserId: string) {
    if (!appSourceSupabase && !appSourceDb) {
      return {
        configured: false,
        employees: 0,
        nfcTags: 0,
        documents: 0,
        permissions: 0,
      };
    }

    const source = await this.readSourceSnapshot();
    const { employees, nfcTags, documents, permissions } = source;

    await appIntegrationRepository.replaceAppSourceSnapshot({
      employees,
      nfcTags,
      documents,
      permissions,
    });

    await logRepository.create({
      userId: actorUserId,
      action: "alteracao",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: "app-source-import",
    });

    return {
      configured: true,
      employees: employees.length,
      nfcTags: nfcTags.length,
      documents: documents.length,
      permissions: permissions.length,
    };
  }

  private async readSourceSnapshot() {
    if (appSourceSupabase) {
      const [
        employeesResponse,
        nfcTagsResponse,
        documentsResponse,
        permissionsResponse,
      ] = await Promise.all([
        appSourceSupabase.from("employees").select("id, full_name, operator_id, is_active, created_at"),
        appSourceSupabase.from("nfc_tags").select("id, employee_id, nfc_code, is_active, created_at"),
        appSourceSupabase.from("documents").select("id, title, description, viewer_url, file_type, is_active, created_at"),
        appSourceSupabase.from("employee_document_permissions").select("id, employee_id, document_id, granted_until, is_active, created_at"),
      ]);

      const sourceError = employeesResponse.error ?? nfcTagsResponse.error ?? documentsResponse.error ?? permissionsResponse.error;
      if (sourceError) {
        throw new AppError(
          "Failed to read source APP Supabase. Confirm a valid read credential for the source project.",
          502,
          sourceError.message,
        );
      }

      return {
        employees: (employeesResponse.data ?? []).map((row) => ({
          id: row.id,
          fullName: row.full_name,
          operatorId: row.operator_id,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        nfcTags: (nfcTagsResponse.data ?? []).map((row) => ({
          id: row.id,
          employeeId: row.employee_id,
          nfcCode: row.nfc_code,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        documents: (documentsResponse.data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description ?? "",
          viewerUrl: row.viewer_url,
          fileType: row.file_type,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        permissions: (permissionsResponse.data ?? []).map((row) => ({
          id: row.id,
          employeeId: row.employee_id,
          documentId: row.document_id,
          grantedUntil: row.granted_until ? new Date(row.granted_until) : null,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
      };
    }

    if (appSourceDb) {
      const [employeesResult, nfcTagsResult, documentsResult, permissionsResult] = await Promise.all([
        appSourceDb.query('select id, full_name, operator_id, is_active, created_at from public.employees'),
        appSourceDb.query('select id, employee_id, nfc_code, is_active, created_at from public.nfc_tags'),
        appSourceDb.query('select id, title, description, viewer_url, file_type, is_active, created_at from public.documents'),
        appSourceDb.query('select id, employee_id, document_id, granted_until, is_active, created_at from public.employee_document_permissions'),
      ]);

      return {
        employees: employeesResult.rows.map((row) => ({
          id: row.id,
          fullName: row.full_name,
          operatorId: row.operator_id,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        nfcTags: nfcTagsResult.rows.map((row) => ({
          id: row.id,
          employeeId: row.employee_id,
          nfcCode: row.nfc_code,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        documents: documentsResult.rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description ?? "",
          viewerUrl: row.viewer_url,
          fileType: row.file_type,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
        permissions: permissionsResult.rows.map((row) => ({
          id: row.id,
          employeeId: row.employee_id,
          documentId: row.document_id,
          grantedUntil: row.granted_until ? new Date(row.granted_until) : null,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
        })),
      };
    }
    throw new AppError("APP source is not configured", 500);
  }

  async hydrateUserAppProfile(userId: string) {
    const employee = await appIntegrationRepository.findEmployeeById(userId);
    const tags = await appIntegrationRepository.listNfcTags(userId);
    const currentTag = tags.find((item) => item.isActive) ?? tags[0] ?? null;

    return {
      employeeActive: employee?.isActive ?? false,
      nfcCode: currentTag?.nfcCode ?? null,
      nfcActive: currentTag?.isActive ?? false,
    };
  }

  async hydrateUserAppAccess(userId: string) {
    const permissions = await appIntegrationRepository.listEmployeeCategoryPermissions(userId);
    return permissions.map((entry) => ({
      id: entry.id,
      userId: entry.employeeId,
      categoryId: entry.categoryId,
      accessUntil: entry.grantedUntil?.toISOString() ?? null,
      enabled: entry.isActive,
      createdAt: entry.createdAt.toISOString(),
      category: memoryDb.categories.find((item) => item.id === entry.categoryId) ?? null,
    }));
  }

  private async getActiveCategoryPermissions(userId: string) {
    const now = Date.now();
    const permissions = await appIntegrationRepository.listEmployeeCategoryPermissions(userId);
    return permissions.filter((entry) => (
      entry.isActive &&
      (!entry.grantedUntil || entry.grantedUntil.getTime() >= now)
    ));
  }

  private getCurrentNfcCode(userId: string) {
    return memoryDb.nfcTags.find((item) => item.employeeId === userId && item.isActive)?.nfcCode ?? null;
  }
}

export const appIntegrationService = new AppIntegrationService();
