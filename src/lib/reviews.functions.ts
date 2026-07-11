import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/database-types";

export type Review = Database["public"]["Tables"]["product_reviews"]["Row"];
export type ReviewSummary = { average: number; count: number };

function pubClient(): SupabaseClient<Database> | null {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Strip HTML tags — never render user input as HTML anywhere.
function sanitize(s: string | undefined | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

async function ensureAdmin(ctx: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!isAdmin) throw new Response("Forbidden", { status: 403 });
}

export const listProductReviews = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ productId: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<Review[]> => {
    const sb = pubClient();
    if (!sb) return [];
    try {
      const { data: rows, error } = await sb
        .from("product_reviews")
        .select("*")
        .eq("product_id", data.productId)
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (error) return [];
      return rows ?? [];
    } catch {
      return [];
    }
  });

export const getReviewSummary = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ productId: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<ReviewSummary> => {
    const sb = pubClient();
    if (!sb) return { average: 0, count: 0 };
    try {
      const { data: rows, error } = await sb
        .from("product_reviews")
        .select("rating")
        .eq("product_id", data.productId)
        .eq("approved", true);
      if (error || !rows || rows.length === 0) return { average: 0, count: 0 };
      const sum = rows.reduce((a, r) => a + Number(r.rating), 0);
      return { average: Math.round((sum / rows.length) * 10) / 10, count: rows.length };
    } catch {
      return { average: 0, count: 0 };
    }
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        name: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(255).optional().or(z.literal("")),
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().max(120).optional(),
        comment: z.string().trim().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = pubClient();
    if (!sb) throw new Error("Server not configured");
    const { error } = await sb.from("product_reviews").insert({
      product_id: data.productId,
      reviewer_name: sanitize(data.name)!,
      reviewer_email: data.email ? sanitize(data.email) : null,
      rating: data.rating,
      title: sanitize(data.title),
      comment: sanitize(data.comment),
      approved: false,
    });
    if (error) throw error;
    return { ok: true };
  });

// ---------- ADMIN (auth + role required) ----------

export const listAllReviewsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<(Review & { product_title?: string })[]> => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .select("*, products(title)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({ ...r, product_title: r.products?.title }));
  });

export const setReviewApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), approved: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_reviews").update({ approved: data.approved }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_reviews").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
