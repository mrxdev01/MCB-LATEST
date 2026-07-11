import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/database-types";

export type PublicProduct = Database["public"]["Tables"]["products"]["Row"] & {
  product_images?: { url: string; sort_order: number; alt?: string | null }[];
  categories?: { slug: string; name: string } | null;
  product_tags?: { tags: { id: string; label: string; color: string; text_color: string; scope: string } | null }[];
};

function pubClient(): SupabaseClient<Database> | null {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const BASE = "*, product_images(url, sort_order, alt), categories(slug, name)";
const BASE_WITH_TAGS = `${BASE}, product_tags(tags(id,label,color,text_color,scope))`;

// Runs `build(query)` against the tags-joined select first; if the join fails
// (tags migration not applied yet) falls back to BASE. Returns PublicProduct[].
async function runProductQuery(
  sb: SupabaseClient<Database>,
  build: (baseQuery: unknown) => unknown,
): Promise<PublicProduct[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySb: any = sb;
  type QRes = { data: unknown[] | null; error: unknown };
  try {
    const q = build(anySb.from("products").select(BASE_WITH_TAGS));
    const res = (await q) as QRes;
    if (!res.error) return (res.data ?? []) as PublicProduct[];
  } catch {
    /* fall through */
  }
  const q2 = build(anySb.from("products").select(BASE));
  const res2 = (await q2) as QRes;
  if (res2.error) throw res2.error;
  return (res2.data ?? []) as PublicProduct[];
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pubClient();
  if (!sb) return [];
  const { data, error } = await sb.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = pubClient();
    if (!sb) return null;
    const { data: cat, error } = await sb.from("categories").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw error;
    return cat;
  });

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        categorySlug: z.string().optional(),
        featuredOnly: z.boolean().optional(),
        limit: z.number().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<PublicProduct[]> => {
    const sb = pubClient();
    if (!sb) return [];
    // Resolve categorySlug -> category_id once so we can push the filter to
    // Postgres instead of fetching every product and filtering client-side.
    let categoryId: string | null = null;
    if (data.categorySlug) {
      const { data: cat } = await sb.from("categories").select("id").eq("slug", data.categorySlug).maybeSingle();
      if (!cat) return [];
      categoryId = cat.id;
    }
    const rows = await runProductQuery(sb, (base) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = (base as any).order("created_at", { ascending: false });
      if (categoryId) q = q.eq("category_id", categoryId);
      if (data.featuredOnly) q = q.eq("is_featured", true);
      // Hard cap protects against unbounded scans as catalog grows.
      q = q.limit(data.limit ?? 500);
      return q;
    });
    return rows;
  });


export const listBestsellers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ limit: z.number().default(12) }).parse(d ?? {}))
  .handler(async ({ data }): Promise<PublicProduct[]> => {
    const sb = pubClient();
    if (!sb) return [];
    return runProductQuery(sb, (base) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = base;
      return q.eq("is_bestseller", true)
        .order("bestseller_rank", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(data.limit);
    });
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }): Promise<PublicProduct | null> => {
    const sb = pubClient();
    if (!sb) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await runProductQuery(sb, (base) => (base as any).eq("slug", data.slug));
    return rows[0] ?? null;
  });

export const relatedProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ productId: z.string(), categoryId: z.string().nullable().optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<PublicProduct[]> => {
    const sb = pubClient();
    if (!sb) return [];
    return runProductQuery(sb, (base) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = (base as any).neq("id", data.productId);
      if (data.categoryId) q = q.eq("category_id", data.categoryId);
      return q.limit(4);
    });
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ q: z.string() }).parse(d))
  .handler(async ({ data }): Promise<PublicProduct[]> => {
    const sb = pubClient();
    if (!sb) return [];
    const q = data.q.trim();
    if (!q) return [];
    const rows = await runProductQuery(sb, (base) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base as any).or(`title.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`).limit(50),
    );
    return rows;
  });

export const listAllProductSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pubClient();
  if (!sb) return [];
  const { data, error } = await sb.from("products").select("slug, updated_at");
  if (error) throw error;
  return data ?? [];
});
