import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { logsTable } from "../../shared/database/schema";
import type { CreateLogInput } from "./logs.types";

class LogRepository {
  async list() {
    if (db) {
      const rows = await db.select().from(logsTable);
      memoryDb.logs = rows.map((row) => ({
        ...row,
        documentId: row.documentId ?? null,
        revisionId: row.revisionId ?? null,
        ipAddress: row.ipAddress ?? null,
        device: row.device ?? null,
        timestamp: new Date(row.timestamp),
      }));
    }

    return [...memoryDb.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async create(input: CreateLogInput) {
    const log = {
      id: nextMemoryId(),
      ...input,
    };

    if (db) {
      await db.insert(logsTable).values(log);
    }

    memoryDb.logs.push(log);
    return log;
  }
}

export const logRepository = new LogRepository();
