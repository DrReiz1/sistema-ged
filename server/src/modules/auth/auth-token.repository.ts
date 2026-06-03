import { lte } from "drizzle-orm";
import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { revokedTokensTable } from "../../shared/database/schema";

class AuthTokenRepository {
  async revokeToken(input: { token: string; userId: string; expiresAt: Date }) {
    await this.purgeExpiredTokens();

    const existing = memoryDb.revokedTokens.find((entry) => entry.token === input.token);
    if (existing) {
      return existing;
    }

    const revokedToken = {
      id: nextMemoryId(),
      token: input.token,
      userId: input.userId,
      expiresAt: input.expiresAt,
      revokedAt: new Date(),
    };

    memoryDb.revokedTokens.push(revokedToken);

    if (db) {
      await db.insert(revokedTokensTable).values(revokedToken).onConflictDoNothing().catch(() => undefined);
    }

    return revokedToken;
  }

  async isTokenRevoked(token: string) {
    await this.purgeExpiredTokens();
    return memoryDb.revokedTokens.some((entry) => entry.token === token);
  }

  async purgeExpiredTokens() {
    const now = new Date();
    memoryDb.revokedTokens = memoryDb.revokedTokens.filter((entry) => entry.expiresAt.getTime() > now.getTime());

    if (db) {
      await db.delete(revokedTokensTable).where(lte(revokedTokensTable.expiresAt, now)).catch(() => undefined);
    }
  }
}

export const authTokenRepository = new AuthTokenRepository();
