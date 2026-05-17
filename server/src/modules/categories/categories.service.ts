import { AppError } from "../../shared/errors/app-error";
import { logRepository } from "../logs/logs.repository";
import { categoryRepository } from "./categories.repository";
import type { CreateCategoryInput } from "./categories.types";

class CategoryService {
  async list() {
    return categoryRepository.list();
  }

  async create(input: CreateCategoryInput, actorUserId: string) {
    const existing = await categoryRepository.findByPrefix(input.prefix);
    if (existing) {
      throw new AppError("Category prefix already exists", 409);
    }

    const category = await categoryRepository.create(input);
    await logRepository.create({
      userId: actorUserId,
      action: "category_create",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return category;
  }
}

export const categoryService = new CategoryService();
