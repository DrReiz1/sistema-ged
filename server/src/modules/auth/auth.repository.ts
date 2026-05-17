import { memoryDb } from "../../shared/database/memory";

class AuthRepository {
  async findUserByEmail(email: string) {
    return memoryDb.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findUserByRfidTag(rfidTag: string) {
    return memoryDb.users.find((user) => user.rfidTag === rfidTag) ?? null;
  }
}

export const authRepository = new AuthRepository();
