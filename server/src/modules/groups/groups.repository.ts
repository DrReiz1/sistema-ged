import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { groupsTable, userGroupPermissionsTable } from "../../shared/database/schema";
import type { AssignUserGroupPermissionInput, CreateGroupInput } from "./groups.types";

class GroupRepository {
  async list() {
    return memoryDb.groups;
  }

  async create(input: CreateGroupInput) {
    const group = {
      id: nextMemoryId(),
      name: input.name,
      description: input.description ?? null,
    };

    if (db) {
      await db.insert(groupsTable).values(group);
    }

    memoryDb.groups.push(group);
    return group;
  }

  async assignUserGroupPermission(input: AssignUserGroupPermissionInput) {
    const existing = memoryDb.userGroupPermissions.find(
      (permission) => permission.userId === input.userId && permission.groupId === input.groupId,
    );

    if (existing) {
      return existing;
    }

    const permission = {
      id: nextMemoryId(),
      userId: input.userId,
      groupId: input.groupId,
    };

    if (db) {
      await db.insert(userGroupPermissionsTable).values(permission);
    }

    memoryDb.userGroupPermissions.push(permission);
    return permission;
  }

  async getUserGroupPermissions(userId: string) {
    const groupIds = memoryDb.userGroupPermissions
      .filter((permission) => permission.userId === userId)
      .map((permission) => permission.groupId);

    return memoryDb.groups.filter((group) => groupIds.includes(group.id));
  }
}

export const groupRepository = new GroupRepository();
