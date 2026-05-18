import { AppError } from "../../shared/errors/app-error";
import { memoryDb } from "../../shared/database/memory";
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

    if (input.nfcCode) {
      const tagOwner = memoryDb.nfcTags.find((item) => item.nfcCode === input.nfcCode && item.employeeId !== input.userId);
      if (tagOwner) {
        throw new AppError("NFC tag already assigned to another employee", 409);
      }
    }

    await userRepository.updateAppIdentity(user.id, {
      operatorId: user.operatorId,
      rfidTag: input.nfcCode,
    });

    await appIntegrationRepository.upsertEmployee({
      id: user.id,
      fullName: user.name,
      operatorId: user.operatorId,
      isActive: input.employeeActive,
      createdAt: user.createdAt,
    });

    await appIntegrationRepository.replaceEmployeeNfcTag(user.id, input.nfcCode, input.nfcActive);
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
    const tag = await appIntegrationRepository.findActiveNfcTag(input.rfidTag);
    const employee = tag ? await appIntegrationRepository.findEmployeeById(tag.employeeId) : null;

    if (!tag || !employee || !employee.isActive) {
      const knownUser = await userRepository.findByRfidTag(input.rfidTag);
      if (knownUser) {
        await appIntegrationRepository.createAppLog({
          userId: knownUser.id,
          rfidTagSnapshot: input.rfidTag,
          action: "app_access_denied",
          ipAddress: meta.ipAddress ?? null,
          device: meta.device ?? null,
        });
      }

      throw new AppError("RFID not recognized", 401);
    }

    await appIntegrationRepository.createAppLog({
      userId: employee.id,
      rfidTagSnapshot: input.rfidTag,
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
            viewerUrl: hydrated.currentRevision?.fileUrl ?? "",
            fileType: hydrated.currentRevision?.fileType ?? "unknown",
            isActive: hydrated.status === "active",
          };
        }),
    );

    await appIntegrationRepository.createAppLog({
      userId: employee.id,
      rfidTagSnapshot: this.getCurrentNfcCode(employee.id) ?? "unknown",
      action: "app_documents_viewed",
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
      action: input.action,
      ipAddress: input.ipAddress ?? null,
      device: input.device ?? null,
    });
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
