import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { categoriesTable } from "../../shared/database/schema";
import type { CreateCategoryInput } from "./categories.types";

class CategoryRepository {
  async list() {
    return memoryDb.categories;
  }

  async findById(id: string) {
    return memoryDb.categories.find((category) => category.id === id) ?? null;
  }

  async findByPrefix(prefix: string) {
    return memoryDb.categories.find((category) => category.prefix.toLowerCase() === prefix.toLowerCase()) ?? null;
  }

  async create(input: CreateCategoryInput) {
    const category = {
      id: nextMemoryId(),
      name: input.name,
      prefix: input.prefix.toUpperCase(),
      description: input.description ?? null,
    };

    if (db) {
      await db.insert(categoriesTable).values(category);
    }

    memoryDb.categories.push(category);
    return category;
  }
}

export const categoryRepository = new CategoryRepository();
