import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/database-types";

export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

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

function conflict(field: string, message: string): never {
  throw new Response(JSON.stringify({ field, message }), {
    status: 409,
    headers: { "content-type": "application/json" },
  });
}

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async (): Promise<BlogPost[]> => {
  const sb = pubClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

export const getBlogPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const sb = pubClient();
    if (!sb) return null;
    try {
      const { data: row, error } = await sb
        .from("blog_posts")
        .select("*")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();
      if (error) return null;
      return row;
    } catch {
      return null;
    }
  });

// ---------- ADMIN ----------

export const listAllBlogPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BlogPost[]> => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getBlogPostByIdAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<BlogPost | null> => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("blog_posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, digits, hyphens only"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().min(1).max(200000),
  cover_image: z.string().url().max(1000).optional().nullable().or(z.literal("")),
  author: z.string().trim().max(80).optional().nullable(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
  seo_title: z.string().trim().max(200).optional().nullable(),
  seo_description: z.string().trim().max(400).optional().nullable(),
  published: z.boolean(),
});

export const upsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Uniqueness pre-check
    const dupChecks: { field: string; column: string; value: string | null | undefined }[] = [
      { field: "slug", column: "slug", value: data.slug },
      { field: "title", column: "title", value: data.title },
      { field: "seo_title", column: "seo_title", value: data.seo_title || null },
      { field: "seo_description", column: "seo_description", value: data.seo_description || null },
    ];
    for (const c of dupChecks) {
      if (!c.value) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabaseAdmin.from("blog_posts").select("id").eq(c.column, c.value).limit(1);
      if (data.id) q = q.neq("id", data.id);
      const { data: hit } = await q;
      if (hit && hit.length) conflict(c.field, `Ye ${c.field.replace("_", " ")} already use ho raha hai — dusra choose karo.`);
    }

    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      content: data.content,
      cover_image: data.cover_image || null,
      author: data.author || "MEENU COLLECTION",
      tags: data.tags ?? [],
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      published: data.published,
      published_at: data.published ? new Date().toISOString() : null,
    };

    if (data.id) {
      // Diff cover image so replaced ones are cleaned from storage
      const { data: prev } = await supabaseAdmin.from("blog_posts").select("cover_image, content").eq("id", data.id).maybeSingle();
      const { error } = await supabaseAdmin.from("blog_posts").update(payload).eq("id", data.id);
      if (error) throw error;

      // Best-effort storage cleanup
      try {
        const { safeDeleteStorageUrls, extractImageUrls } = await import("@/lib/storage.server");
        const oldImgs = new Set<string>([...(prev?.cover_image ? [prev.cover_image] : []), ...extractImageUrls(prev?.content)]);
        const newImgs = new Set<string>([...(payload.cover_image ? [payload.cover_image] : []), ...extractImageUrls(payload.content)]);
        const removed = [...oldImgs].filter((u) => !newImgs.has(u));
        if (removed.length) await safeDeleteStorageUrls(removed);
      } catch (e) { console.warn("[blog] cleanup skipped", e); }

      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin.from("blog_posts").insert(payload).select("id").single();
    if (error) throw error;
    return { ok: true, id: inserted.id };
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load images before delete for storage cleanup
    const { data: prev } = await supabaseAdmin.from("blog_posts").select("cover_image, content").eq("id", data.id).maybeSingle();

    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw error;

    try {
      const { safeDeleteStorageUrls, extractImageUrls } = await import("@/lib/storage.server");
      const urls = [prev?.cover_image ?? null, ...extractImageUrls(prev?.content)];
      await safeDeleteStorageUrls(urls);
    } catch (e) { console.warn("[blog] cleanup skipped", e); }

    return { ok: true };
  });

export const listAllBlogSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pubClient();
  if (!sb) return [] as { slug: string; updated_at: string | null }[];
  try {
    const { data, error } = await sb.from("blog_posts").select("slug, updated_at").eq("published", true);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});
