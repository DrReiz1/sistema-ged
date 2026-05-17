import { AppError } from "../../shared/errors/app-error";
import { logRepository } from "../logs/logs.repository";
import { tagRepository } from "./tags.repository";
import type { CreateTagInput } from "./tags.types";

class TagService {
  async list() {
    return tagRepository.list();
  }

  async create(input: CreateTagInput, actorUserId: string) {
    const existing = (await tagRepository.list()).find((tag) => tag.name.toLowerCase() === input.name.toLowerCase());
    if (existing) {
      throw new AppError("Tag already exists", 409);
    }

    const tag = await tagRepository.create(input);
    await logRepository.create({
      userId: actorUserId,
      action: "tag_create",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return tag;
  }
}

export const tagService = new TagService();
