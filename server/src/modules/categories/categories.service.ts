import { AppError } from "../../shared/errors/app-error";
import { userRepository } from "../users/users.repository";
import { appIntegrationRepository } from "../app-integration/app-integration.repository";
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
    const masterUser = await userRepository.findByRfidTag("MASTER_DOCKSTATION_2026");
    if (masterUser) {
      const existingPermissions = await appIntegrationRepository.listEmployeeCategoryPermissions(masterUser.id);
      const categoryIds = Array.from(new Set([
        ...existingPermissions
          .filter((entry) => entry.isActive)
          .map((entry) => entry.categoryId),
        category.id,
      ]));

      await appIntegrationRepository.syncEmployeeCategoryPermissions(masterUser.id, categoryIds, {
        grantedUntil: null,
        isActive: true,
      });
    }

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
