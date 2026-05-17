import { AppError } from "../../shared/errors/app-error";
import { logRepository } from "../logs/logs.repository";
import { userRepository } from "../users/users.repository";
import { groupRepository } from "./groups.repository";
import type { AssignUserGroupPermissionInput, CreateGroupInput } from "./groups.types";

class GroupService {
  async list() {
    return groupRepository.list();
  }

  async create(input: CreateGroupInput, actorUserId: string) {
    const existing = (await groupRepository.list()).find((group) => group.name === input.name);
    if (existing) {
      throw new AppError("Group already exists", 409);
    }

    const group = await groupRepository.create(input);

    await logRepository.create({
      userId: actorUserId,
      action: "group_create",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return group;
  }

  async assignUserPermission(input: AssignUserGroupPermissionInput, actorUserId: string) {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const permission = await groupRepository.assignUserGroupPermission(input);

    await logRepository.create({
      userId: actorUserId,
      action: "alteracao_permissao",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return permission;
  }
}

export const groupService = new GroupService();
