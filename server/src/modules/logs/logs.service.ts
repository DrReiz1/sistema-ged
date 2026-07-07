import { logRepository } from "./logs.repository";
import { appIntegrationRepository } from "../app-integration/app-integration.repository";
import { groupRepository } from "../groups/groups.repository";
import { memoryDb } from "../../shared/database/memory";
import type { CreateRuntimeLogInput } from "./logs.types";

const supervisorVisibleActions = new Set([
  "upload",
  "download",
  "visualizacao",
  "document_opened",
  "document_closed",
  "publicacao_revisao",
  "conclusao_lote",
  "app_access_granted",
  "app_documents_viewed",
  "app_module_selected",
]);

class LogService {
  async list(meta: { userId: string; role: string }) {
    const systemLogs = await logRepository.list();
    const appLogs = await appIntegrationRepository.listAppLogs();
    const logs = [
      ...systemLogs.map((entry) => this.serializeSystemLog(entry)),
      ...appLogs.map((entry) => this.serializeAppLog(entry)),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (meta.role === "admin") {
      return logs;
    }

    if (meta.role === "supervisor") {
      const allowedGroupIds = (await groupRepository.getUserGroupPermissions(meta.userId)).map((group) => group.id);
      return logs
        .filter((entry) => {
          if (!supervisorVisibleActions.has(entry.action)) {
            return false;
          }

          if (entry.groupId) {
            return allowedGroupIds.includes(entry.groupId);
          }

          if (!entry.documentId) {
            return false;
          }

          const document = memoryDb.documents.find((item) => item.id === entry.documentId);
          return document ? allowedGroupIds.includes(document.groupId) : false;
        })
        .map((entry) => ({
          ...entry,
          ipAddress: null,
          device: null,
          revisionId: null,
        }));
    }

    return [];
  }

  async createRuntimeLog(input: CreateRuntimeLogInput, meta: {
    userId: string;
    ipAddress?: string;
    device?: string;
  }) {
    return logRepository.create({
      userId: meta.userId,
      action: input.action,
      documentId: input.documentId ?? null,
      revisionId: input.revisionId ?? null,
      timestamp: input.timestamp ?? new Date(),
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });
  }

  private serializeSystemLog(entry: Awaited<ReturnType<typeof logRepository.list>>[number]) {
    const user = memoryDb.users.find((item) => item.id === entry.userId);
    const document = entry.documentId
      ? memoryDb.documents.find((item) => item.id === entry.documentId) ?? null
      : null;

    return {
      ...entry,
      source: "system" as const,
      userName: user?.name ?? null,
      groupId: document?.groupId ?? null,
    };
  }

  private serializeAppLog(entry: Awaited<ReturnType<typeof appIntegrationRepository.listAppLogs>>[number]) {
    const user = memoryDb.users.find((item) => item.id === entry.userId);

    return {
      id: entry.id,
      userId: entry.userId,
      userName: user?.name ?? null,
      userOperatorId: user?.operatorId ?? null,
      action: entry.action,
      documentId: entry.documentId,
      revisionId: null,
      timestamp: entry.timestamp,
      ipAddress: entry.ipAddress,
      device: entry.device,
      source: entry.source,
      groupId: entry.groupId,
      rfidTagSnapshot: entry.rfidTagSnapshot,
    };
  }
}

export const logService = new LogService();
