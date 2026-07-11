// Server-only helpers for Supabase Storage cleanup.
// Filename ends in .server.ts so the bundler blocks it from client bundles.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Parse a Supabase public URL like
 *  https://<proj>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *  into { bucket, path }. Returns null if the URL isn't ours. */
export function parseStorageUrl(url: string | null | undefined): { bucket: string; path: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { bucket: decodeURIComponent(m[1]), path: decodeURIComponent(m[2].split("?")[0]) };
  } catch {
    return null;
  }
}

/** Best-effort delete of a list of public URLs. Never throws. */
export async function safeDeleteStorageUrls(urls: (string | null | undefined)[]): Promise<void> {
  const byBucket = new Map<string, string[]>();
  for (const url of urls) {
    const parsed = parseStorageUrl(url);
    if (!parsed) continue;
    const list = byBucket.get(parsed.bucket) ?? [];
    list.push(parsed.path);
    byBucket.set(parsed.bucket, list);
  }
  for (const [bucket, paths] of byBucket.entries()) {
    try {
      const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
      if (error) console.warn("[storage] delete failed", bucket, error.message);
    } catch (e) {
      console.warn("[storage] delete threw", bucket, e);
    }
  }
}

/** Extract image URLs from HTML content (best-effort). */
export function extractImageUrls(html: string | null | undefined): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  return urls;
}
