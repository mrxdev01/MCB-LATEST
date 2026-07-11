import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Tag = {
  id: string;
  label: string;
  color: string;
  text_color: string;
  scope: "product" | "collection" | "category" | "all";
  sort_order: number;
};

// Tags table is added by a manual migration (docs/migrations/20260710_tags_bestsellers.sql).
// Until the user runs it, these functions no-op gracefully.
function pub(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const listTags = createServerFn({ method: "GET" }).handler(async (): Promise<Tag[]> => {
  const sb = pub();
  if (!sb) return [];
  const { data, error } = await sb.from("tags").select("*").order("sort_order").order("created_at");
  if (error) return [];
  return (data ?? []) as Tag[];
});

const TagInput = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  scope: z.enum(["product", "collection", "category", "all"]).default("all"),
  sort_order: z.number().int().default(0),
});

export const saveTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TagInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });
    const sb = context.supabase as unknown as SupabaseClient;
    if (data.id) {
      const { data: row, error } = await sb.from("tags").update({ ...data, updated_at: new Date().toISOString() }).eq("id", data.id).select().single();
      if (error) throw error;
      return row as Tag;
    }
    const { data: row, error } = await sb.from("tags").insert(data).select().single();
    if (error) throw error;
    return row as Tag;
  });

export const deleteTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });
    const sb = context.supabase as unknown as SupabaseClient;
    const { error } = await sb.from("tags").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
