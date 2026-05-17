import { createClient } from "@supabase/supabase-js";
import { loadEnvironment } from "./env";

loadEnvironment();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "documents";

export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
