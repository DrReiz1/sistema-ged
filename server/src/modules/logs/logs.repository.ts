import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { logsTable } from "../../shared/database/schema";
import type { CreateLogInput } from "./logs.types";

class LogRepository {
  async list() {
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
