import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side image importer.
 * Fetches an external URL (bypasses browser CORS), uploads the raw bytes into
 * a public Supabase Storage bucket, returns the public URL.
 *
 * Client is expected to run our compressor on File uploads. For URL uploads
 * we store the bytes as-is (source is already a compressed web asset ~99% of
 * the time). This preserves quality perfectly.
 */
export const importImageFromUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      url: z.string().url(),
      bucket: z.enum(["product-images", "collection-images"]).default("product-images"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Admin-only
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const res = await fetch(data.url, { redirect: "follow" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) throw new Error("URL did not return an image");

    const bytes = new Uint8Array(await res.arrayBuffer());
    // Safety cap: 15 MB
    if (bytes.byteLength > 15 * 1024 * 1024) throw new Error("Image too large (>15MB)");

    const ext = (contentType.split("/")[1] || "jpg").split(";")[0].replace("jpeg", "jpg");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await context.supabase.storage
      .from(data.bucket)
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw error;

    const { data: pub } = context.supabase.storage.from(data.bucket).getPublicUrl(path);
    return { url: pub.publicUrl };
  });
