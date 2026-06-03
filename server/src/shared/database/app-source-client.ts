import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import { loadEnvironment } from "./env";

loadEnvironment();

const sourceSupabaseUrl = process.env.APP_SOURCE_SUPABASE_URL;
const sourceSupabaseServiceRoleKey = process.env.APP_SOURCE_SUPABASE_SERVICE_ROLE_KEY;
const sourceDatabaseUrl = process.env.APP_SOURCE_DATABASE_URL;

export const appSourceSupabase = sourceSupabaseUrl && sourceSupabaseServiceRoleKey
  ? createClient(sourceSupabaseUrl, sourceSupabaseServiceRoleKey)
  : null;

export const appSourceDb = sourceDatabaseUrl
  ? new Pool({
      connectionString: sourceDatabaseUrl,
      max: 1,
      ssl: { rejectUnauthorized: false },
    })
  : null;
