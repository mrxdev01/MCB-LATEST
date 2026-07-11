import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — admin client will throw on use.");
}

export const supabaseAdmin = createClient<Database>(url ?? "", key ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});
