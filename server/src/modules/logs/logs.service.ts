import { logRepository } from "./logs.repository";
import type { CreateRuntimeLogInput } from "./logs.types";

class LogService {
  async list() {
    return logRepository.list();
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
}

export const logService = new LogService();
