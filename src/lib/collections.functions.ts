import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/database-types";

function pubClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const listCollections = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pubClient();
  if (!sb) return [];
  const { data, error } = await sb.from("collections").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const listTopCollections = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pubClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("collections")
    .select("*")
    .is("parent_id", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

type PublicProduct = Database["public"]["Tables"]["products"]["Row"] & {
  product_images?: { url: string; sort_order: number }[];
};
type PublicCollection = Database["public"]["Tables"]["collections"]["Row"];
type CollectionDetail = PublicCollection & { children: PublicCollection[]; products: PublicProduct[] };

export const getCollectionBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }): Promise<CollectionDetail | null> => {
    const sb = pubClient();
    if (!sb) return null;
    const { data: col, error } = await sb.from("collections").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw error;
    if (!col) return null;

    const { data: children } = await sb
      .from("collections")
      .select("*")
      .eq("parent_id", col.id)
      .order("sort_order");

    const { data: pcRows } = await sb
      .from("product_collections")
      .select("product_id")
      .eq("collection_id", col.id);
    const pids = (pcRows ?? []).map((r) => r.product_id);

    let products: PublicProduct[] = [];
    if (pids.length) {
      const { data: prodRows } = await sb
        .from("products")
        .select("*, product_images(url, sort_order)")
        .in("id", pids);
      products = (prodRows ?? []) as unknown as PublicProduct[];
    }

    return { ...col, children: children ?? [], products };
  });

const CollectionInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, digits, hyphens only"),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().max(1000).optional().nullable(),
  parent_id: z.string().uuid().nullable().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

function conflict(field: string, message: string): never {
  throw new Response(JSON.stringify({ field, message }), {
    status: 409,
    headers: { "content-type": "application/json" },
  });
}

export const saveCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CollectionInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    // Uniqueness pre-check
    for (const c of [{ field: "slug", column: "slug", value: data.slug }, { field: "name", column: "name", value: data.name }]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = context.supabase.from("collections").select("id").eq(c.column, c.value).limit(1);
      if (data.id) q = q.neq("id", data.id);
      const { data: hit } = await q;
      if (hit && hit.length) conflict(c.field, `Ye ${c.field} already use ho raha hai — dusra choose karo.`);
    }

    if (data.id) {
      // Diff image_url for storage cleanup
      const { data: prev } = await context.supabase.from("collections").select("image_url").eq("id", data.id).maybeSingle();
      const { data: row, error } = await context.supabase.from("collections").update(data).eq("id", data.id).select().single();
      if (error) throw error;
      try {
        if (prev?.image_url && prev.image_url !== data.image_url) {
          const { safeDeleteStorageUrls } = await import("@/lib/storage.server");
          await safeDeleteStorageUrls([prev.image_url]);
        }
      } catch (e) { console.warn("[collection] cleanup skipped", e); }
      return row;
    }
    const { data: row, error } = await context.supabase.from("collections").insert(data).select().single();
    if (error) throw error;
    return row;
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { data: prev } = await context.supabase.from("collections").select("image_url").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from("collections").delete().eq("id", data.id);
    if (error) throw error;

    try {
      if (prev?.image_url) {
        const { safeDeleteStorageUrls } = await import("@/lib/storage.server");
        await safeDeleteStorageUrls([prev.image_url]);
      }
    } catch (e) { console.warn("[collection] cleanup skipped", e); }

    return { ok: true };
  });

export const setCollectionProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ collectionId: z.string(), productIds: z.array(z.string()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });
    await context.supabase.from("product_collections").delete().eq("collection_id", data.collectionId);
    if (data.productIds.length) {
      const rows = data.productIds.map((pid, i) => ({ product_id: pid, collection_id: data.collectionId, sort_order: i }));
      const { error } = await context.supabase.from("product_collections").insert(rows);
      if (error) throw error;
    }
    return { ok: true };
  });
