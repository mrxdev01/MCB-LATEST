// Near-lossless image compressor.
// Preserves alpha (PNG) and skips work when a smaller size cannot be produced.
// Only downscales when a dimension exceeds MAX_DIM (2400 px).
//
// The goal: identical-looking output, but as small as the encoder can honestly make it.

const MAX_DIM = 2400;
const TARGET_MAX_BYTES = 500 * 1024; // aim for <500 KB; keep quality high

export async function compressImage(file: File, maxDim = MAX_DIM): Promise<File> {
  if (typeof window === "undefined") return file;
  // Never touch SVG / GIF / already-optimized WebP tiny files.
  if (/svg\+xml|gif/i.test(file.type)) return file;
  if (file.size < 60 * 1024) return file; // already small

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file;
  }

  const hasAlpha = await detectAlpha(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: hasAlpha });
  if (!ctx) return file;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);

  // For PNGs / transparent art: keep PNG (lossless) if it's already reasonable,
  // otherwise fall back to lossless webp.
  const mime = hasAlpha ? "image/webp" : "image/webp";
  const qualities = hasAlpha ? [1, 0.95] : [0.92, 0.88, 0.82, 0.75];

  let best: Blob | null = null;
  for (const q of qualities) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, mime, q));
    if (!blob) continue;
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= TARGET_MAX_BYTES) break;
  }
  if (!best) return file;

  // If our output is bigger than the original, keep the original.
  if (best.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "");
  const ext = mime === "image/webp" ? "webp" : "jpg";
  return new File([best], `${base}.${ext}`, { type: mime });
}

async function detectAlpha(file: File): Promise<boolean> {
  if (!/png|webp/i.test(file.type)) return false;
  // Fast heuristic: PNG/WEBP could carry alpha; probe a tiny slice.
  try {
    const buf = await file.slice(0, 32).arrayBuffer();
    const view = new Uint8Array(buf);
    // PNG signature: check color type byte (offset 25) — 4 or 6 = alpha
    if (view[0] === 0x89 && view[1] === 0x50) {
      const colorType = view[25];
      return colorType === 4 || colorType === 6;
    }
  } catch {
    /* noop */
  }
  return /png/i.test(file.type);
}

/** Compress a Blob (used by URL-import server function output re-encoded on the client). */
export async function compressBlob(blob: Blob, filename = "image"): Promise<File> {
  const f = new File([blob], filename, { type: blob.type || "image/jpeg" });
  return compressImage(f);
}

/**
 * Center-crop an image to a perfect square, then compress.
 * Used for product images so every gallery tile renders identical 1:1 without CSS cropping.
 */
export async function squareImage(file: File, size = 1600): Promise<File> {
  if (typeof window === "undefined") return file;
  if (/svg\+xml|gif/i.test(file.type)) return file;

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return compressImage(file);
  }

  if (bmp.width === bmp.height && bmp.width <= size + 1) {
    return compressImage(file);
  }

  const side = Math.min(bmp.width, bmp.height);
  const sx = Math.round((bmp.width - side) / 2);
  const sy = Math.round((bmp.height - side) / 2);
  const out = Math.min(size, side);

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return compressImage(file);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(0, 0, out, out);
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, out, out);

  let best: Blob | null = null;
  for (const q of [0.9, 0.85, 0.8]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
    if (!blob) continue;
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= TARGET_MAX_BYTES) break;
  }
  if (!best) return compressImage(file);

  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([best], `${base}.webp`, { type: "image/webp" });
}
