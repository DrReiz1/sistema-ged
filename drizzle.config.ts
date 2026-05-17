import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

for (const candidate of [".env", ".env.local"]) {
  const absolutePath = path.resolve(process.cwd(), candidate);
  if (!existsSync(absolutePath)) {
    continue;
  }

  const contents = readFileSync(absolutePath, "utf-8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./server/src/shared/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
