import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

let _client: SupabaseClient<Database> | null = null;

function build(): SupabaseClient<Database> {
  if (_client) return _client;
  if (!url || !key) {
    // Return a proxy that throws only when actually used (avoids SSR crash pre-env)
    return new Proxy({} as SupabaseClient<Database>, {
      get() {
        throw new Error(
          "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env",
        );
      },
    });
  }
  _client = createClient<Database>(url, key, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return _client;
}

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_t, prop) {
    const c = build() as unknown as Record<string | symbol, unknown>;
    return c[prop];
  },
});
