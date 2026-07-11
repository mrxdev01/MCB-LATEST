// Lightweight image URL helper.
// For ImageKit-hosted images (ik.imagekit.io) we append transform params
// (width + auto-format + quality) via the `?tr=` query string. Non-ImageKit
// URLs are returned unchanged so we never break external / placeholder images.

const IK_HOST = "ik.imagekit.io";

function isImageKit(url: string | undefined | null): url is string {
  if (!url) return false;
  return url.includes(IK_HOST);
}

/**
 * Returns a URL sized for the requested display width.
 * width is CSS px at 1x — we let ImageKit's f-auto pick WebP/AVIF.
 */
export function ikUrl(url: string | undefined | null, width: number, quality = 75): string {
  if (!url) return "";
  if (!isImageKit(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=w-${Math.round(width)},f-auto,q-${quality}`;
}

/**
 * Builds a srcset for responsive images. Only emits multiple entries for
 * ImageKit sources; otherwise returns undefined so React drops the attribute.
 */
export function ikSrcSet(
  url: string | undefined | null,
  widths: number[] = [200, 400, 600, 800],
  quality = 75,
): string | undefined {
  if (!isImageKit(url)) return undefined;
  return widths
    .map((w) => `${ikUrl(url, w, quality)} ${w}w`)
    .join(", ");
}
