import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadEnvironment } from "./env";
import * as schema from "./schema";

loadEnvironment();

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;
