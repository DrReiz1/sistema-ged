import { logRepository } from "./logs.repository";
import { groupRepository } from "../groups/groups.repository";
import { memoryDb } from "../../shared/database/memory";
import type { CreateRuntimeLogInput } from "./logs.types";

const supervisorVisibleActions = new Set([
  "upload",
  "download",
  "visualizacao",
  "publicacao_revisao",
  "conclusao_lote",
]);

class LogService {
  async list(meta: { userId: string; role: string }) {
    const logs = await logRepository.list();

    if (meta.role === "admin") {
      return logs.map((entry) => this.serializeLog(entry));
    }

    if (meta.role === "supervisor") {
      const allowedGroupIds = (await groupRepository.getUserGroupPermissions(meta.userId)).map((group) => group.id);
      return logs
        .filter((entry) => {
          if (!supervisorVisibleActions.has(entry.action) || !entry.documentId) {
            return false;
          }

          const document = memoryDb.documents.find((item) => item.id === entry.documentId);
          return document ? allowedGroupIds.includes(document.groupId) : false;
        })
        .map((entry) => this.serializeLog(entry, { sanitizeSensitiveFields: true }));
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
      timestamp: new Date(),
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });
  }

  private serializeLog(
    entry: Awaited<ReturnType<typeof logRepository.list>>[number],
    options?: { sanitizeSensitiveFields?: boolean },
  ) {
    const user = memoryDb.users.find((item) => item.id === entry.userId);

    return {
      ...entry,
      userName: user?.name ?? null,
      ipAddress: options?.sanitizeSensitiveFields ? null : entry.ipAddress,
      device: options?.sanitizeSensitiveFields ? null : entry.device,
      revisionId: options?.sanitizeSensitiveFields ? null : entry.revisionId,
    };
  }
}

export const logService = new LogService();
