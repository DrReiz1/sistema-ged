import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { usersTable } from "../../shared/database/schema";
import { eq } from "drizzle-orm";
import type { CreateUserInput } from "./users.types";

class UserRepository {
  async list() {
    return memoryDb.users;
  }

  async findById(id: string) {
    return memoryDb.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string) {
    return memoryDb.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findByOperatorId(operatorId: string) {
    return memoryDb.users.find((user) => user.operatorId.toLowerCase() === operatorId.toLowerCase()) ?? null;
  }

  async findByRfidTag(rfidTag: string) {
    return memoryDb.users.find((user) => user.rfidTag === rfidTag) ?? null;
  }

  async create(input: CreateUserInput & { passwordHash: string }) {
    const user = {
      id: nextMemoryId(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      operatorId: input.operatorId,
      rfidTag: input.rfidTag ?? null,
      sector: input.sector,
      active: input.active ?? true,
      createdAt: new Date(),
    };

    if (db) {
      await db.insert(usersTable).values(user);
    }

    memoryDb.users.push(user);
    return user;
  }

  async updateAppIdentity(userId: string, input: { operatorId?: string; rfidTag?: string | null }) {
    const user = memoryDb.users.find((item) => item.id === userId);
    if (!user) {
      return null;
    }

    if (typeof input.operatorId !== "undefined") {
      user.operatorId = input.operatorId;
    }

    if (typeof input.rfidTag !== "undefined") {
      user.rfidTag = input.rfidTag;
    }

    if (db) {
      await db.update(usersTable)
        .set({
          operatorId: user.operatorId,
          rfidTag: user.rfidTag,
        })
        .where(eq(usersTable.id, userId));
    }

    return user;
  }
}

export const userRepository = new UserRepository();
