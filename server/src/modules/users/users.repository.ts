import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { usersTable } from "../../shared/database/schema";
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

  async create(input: CreateUserInput & { passwordHash: string }) {
    const user = {
      id: nextMemoryId(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
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
}

export const userRepository = new UserRepository();
