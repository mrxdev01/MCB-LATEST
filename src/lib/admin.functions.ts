import { createServerFn } from "@tanstack/react-start";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/database-types";

async function ensureAdmin(ctx: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!isAdmin) throw new Response("Forbidden", { status: 403 });
}

function conflict(field: string, message: string): never {
  throw new Response(JSON.stringify({ field, message }), {
    status: 409,
    headers: { "content-type": "application/json" },
  });
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

const ProductInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, digits, hyphens only"),
  title: z.string().trim().min(1).max(200),
  short_description: z.string().trim().max(500).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  price: z.number().nonnegative().max(10_000_000),
  mrp: z.number().nullable().optional(),
  sku: z.string().trim().min(1).max(80),
  stock_status: z.string().max(40).default("in_stock"),
  category_id: z.string().uuid().nullable().optional(),
  sizes: z.array(z.string().max(40)).max(50).default([]),
  tags: z.array(z.string().max(40)).max(50).default([]),
  seo_title: z.string().trim().max(200).nullable().optional(),
  seo_description: z.string().trim().max(400).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  images: z.array(z.string().url().max(1000)).min(1).max(4),
  collection_ids: z.array(z.string().uuid()).default([]),
  tag_ids: z.array(z.string().uuid()).default([]),
});

async function replaceProductTags(sb: SupabaseClient, productId: string, tagIds: string[]) {
  try {
    await sb.from("product_tags").delete().eq("product_id", productId);
    if (tagIds.length) {
      const rows = tagIds.map((tag_id) => ({ product_id: productId, tag_id }));
      await sb.from("product_tags").insert(rows);
    }
  } catch { /* migration not run yet */ }
}

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);

    // Uniqueness pre-check — return structured 409 so UI can highlight the field.
    const dupChecks: { field: string; column: string; value: string | null | undefined }[] = [
      { field: "slug", column: "slug", value: data.slug },
      { field: "sku", column: "sku", value: data.sku },
      { field: "title", column: "title", value: data.title },
      { field: "seo_title", column: "seo_title", value: data.seo_title ?? null },
      { field: "seo_description", column: "seo_description", value: data.seo_description ?? null },
    ];
    for (const c of dupChecks) {
      if (!c.value) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = context.supabase.from("products").select("id").eq(c.column, c.value).limit(1);
      if (data.id) q = q.neq("id", data.id);
      const { data: hit } = await q;
      if (hit && hit.length) conflict(c.field, `Ye ${c.field.replace("_", " ")} already use ho raha hai — dusra choose karo.`);
    }

    const { images, collection_ids, tag_ids, id, ...rest } = data;
    const payload = { ...rest, sizes: rest.sizes as unknown as never };

    let productId = id;
    let previousImageUrls: string[] = [];
    let previousDescription: string | null = null;

    if (id) {
      // Fetch old images/description before update for diff cleanup
      const { data: prevImgs } = await context.supabase.from("product_images").select("url").eq("product_id", id);
      previousImageUrls = (prevImgs ?? []).map((r) => r.url).filter(Boolean) as string[];
      const { data: prevProd } = await context.supabase.from("products").select("description").eq("id", id).maybeSingle();
      previousDescription = prevProd?.description ?? null;

      const { error } = await context.supabase.from("products").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { data: row, error } = await context.supabase.from("products").insert(payload).select("id").single();
      if (error) throw error;
      productId = row.id;
    }
    if (!productId) throw new Error("Failed to save product");

    // Replace images
    await context.supabase.from("product_images").delete().eq("product_id", productId);
    if (images.length) {
      const rows = images.map((url, i) => ({ product_id: productId!, url, sort_order: i }));
      const { error: imgErr } = await context.supabase.from("product_images").insert(rows);
      if (imgErr) throw imgErr;
    }

    // Replace collections
    await context.supabase.from("product_collections").delete().eq("product_id", productId);
    if (collection_ids.length) {
      const rows = collection_ids.map((cid, i) => ({ product_id: productId!, collection_id: cid, sort_order: i }));
      const { error: cErr } = await context.supabase.from("product_collections").insert(rows);
      if (cErr) throw cErr;
    }

    await replaceProductTags(context.supabase as unknown as SupabaseClient, productId, tag_ids);

    // Storage cleanup: remove images that were in the old set but not in the new one
    if (id) {
      try {
        const { safeDeleteStorageUrls, extractImageUrls } = await import("@/lib/storage.server");
        const oldSet = new Set<string>([...previousImageUrls, ...extractImageUrls(previousDescription)]);
        const newSet = new Set<string>([...images, ...extractImageUrls(data.description ?? null)]);
        const removed = [...oldSet].filter((u) => !newSet.has(u));
        if (removed.length) await safeDeleteStorageUrls(removed);
      } catch (e) { console.warn("[product] storage cleanup skipped", e); }
    }

    return { id: productId };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);

    // Collect all storage URLs before deleting the row
    const { data: imgs } = await context.supabase.from("product_images").select("url").eq("product_id", data.id);
    const urls = (imgs ?? []).map((r) => r.url).filter(Boolean) as string[];
    const { data: prod } = await context.supabase.from("products").select("description").eq("id", data.id).maybeSingle();

    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;

    try {
      const { safeDeleteStorageUrls, extractImageUrls } = await import("@/lib/storage.server");
      await safeDeleteStorageUrls([...urls, ...extractImageUrls(prod?.description ?? null)]);
    } catch (e) { console.warn("[product] storage cleanup skipped", e); }

    return { ok: true };
  });

export const toggleBestseller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_bestseller: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("products").update({ is_bestseller: data.is_bestseller }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listAllProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*, product_images(url, sort_order), categories(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getProductForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { data: prod, error } = await context.supabase
      .from("products")
      .select("*, product_images(url, sort_order), product_collections(collection_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;

    let tag_ids: string[] = [];
    try {
      const sb = context.supabase as unknown as SupabaseClient;
      const { data: tt } = await sb.from("product_tags").select("tag_id").eq("product_id", data.id);
      tag_ids = ((tt ?? []) as { tag_id: string }[]).map((r) => r.tag_id);
    } catch { /* tags table not present yet */ }

    return prod ? { ...prod, tag_ids } : null;
  });

export const getAdminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const sb = context.supabase;
    const [
      products, inStock, outOfStock, featured, newArrivals, bestsellers,
      allCollections, subCollections, announcements, recent,
    ] = await Promise.all([
      sb.from("products").select("*", { count: "exact", head: true }),
      sb.from("products").select("*", { count: "exact", head: true }).eq("stock_status", "in_stock"),
      sb.from("products").select("*", { count: "exact", head: true }).eq("stock_status", "out_of_stock"),
      sb.from("products").select("*", { count: "exact", head: true }).eq("is_featured", true),
      sb.from("products").select("*", { count: "exact", head: true }).eq("is_new_arrival", true),
      sb.from("products").select("*", { count: "exact", head: true }).eq("is_bestseller", true),
      sb.from("collections").select("*", { count: "exact", head: true }),
      sb.from("collections").select("*", { count: "exact", head: true }).not("parent_id", "is", null),
      sb.from("announcements").select("*", { count: "exact", head: true }),
      sb.from("products").select("id, title, sku, price, stock_status, created_at, product_images(url, sort_order)").order("created_at", { ascending: false }).limit(6),
    ]);

    return {
      products: products.count ?? 0,
      inStock: inStock.count ?? 0,
      outOfStock: outOfStock.count ?? 0,
      featured: featured.count ?? 0,
      newArrivals: newArrivals.count ?? 0,
      bestsellers: bestsellers.count ?? 0,
      collections: allCollections.count ?? 0,
      subCategories: subCollections.count ?? 0,
      announcements: announcements.count ?? 0,
      recent: recent.data ?? [],
    };
  });
