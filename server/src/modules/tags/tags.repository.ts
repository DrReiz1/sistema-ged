import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { tagsTable } from "../../shared/database/schema";
import type { CreateTagInput } from "./tags.types";

class TagRepository {
  async list() {
    return memoryDb.tags;
  }

  async create(input: CreateTagInput) {
    const tag = {
      id: nextMemoryId(),
      name: input.name,
      color: input.color,
      description: input.description ?? null,
    };

    if (db) {
      await db.insert(tagsTable).values(tag);
    }

    memoryDb.tags.push(tag);
    return tag;
  }
}

export const tagRepository = new TagRepository();
