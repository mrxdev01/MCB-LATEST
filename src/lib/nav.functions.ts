import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/database-types";

export type NavItem = {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  is_visible: boolean;
};

function pubClient(): SupabaseClient<Database> | null {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function ensureAdmin(ctx: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!isAdmin) throw new Response("Forbidden", { status: 403 });
}

const DEFAULTS: NavItem[] = [
  { id: "d-home", label: "Home", url: "/", sort_order: 10, is_visible: true },
  { id: "d-bed", label: "Bedsheets", url: "/bedsheets", sort_order: 20, is_visible: true },
  { id: "d-shirts", label: "Men Shirts", url: "/men-shirts", sort_order: 30, is_visible: true },
  { id: "d-nighty", label: "Nighty", url: "/nighty", sort_order: 40, is_visible: true },
  { id: "d-all", label: "All Products", url: "/products", sort_order: 50, is_visible: true },
  { id: "d-about", label: "About", url: "/about", sort_order: 60, is_visible: true },
  { id: "d-contact", label: "Contact", url: "/contact", sort_order: 70, is_visible: true },
];

export const listNavItems = createServerFn({ method: "GET" }).handler(async (): Promise<NavItem[]> => {
  const sb = pubClient();
  if (!sb) return DEFAULTS;
  try {
    const { data, error } = await sb
      .from("nav_items" as never)
      .select("id,label,url,sort_order,is_visible")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return DEFAULTS;
    return data as unknown as NavItem[];
  } catch {
    return DEFAULTS;
  }
});

export const listNavItemsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NavItem[]> => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("nav_items" as never)
      .select("id,label,url,sort_order,is_visible")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as NavItem[];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().min(1).max(200),
  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
});

export const upsertNavItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    if (data.id) {
      const { error } = await sb.from("nav_items").update({
        label: data.label, url: data.url, sort_order: data.sort_order, is_visible: data.is_visible, updated_at: new Date().toISOString(),
      }).eq("id", data.id);
      if (error) throw error;
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await sb.from("nav_items").insert({
      label: data.label, url: data.url, sort_order: data.sort_order, is_visible: data.is_visible,
    }).select("id").single();
    if (error) throw error;
    return { ok: true, id: row!.id };
  });

export const deleteNavItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { error } = await sb.from("nav_items").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
