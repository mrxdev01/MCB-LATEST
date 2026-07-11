import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { upsertBlogPost, type BlogPost } from "@/lib/blog.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";

export function BlogEditor({ initial, onSaved }: { initial?: BlogPost; onSaved: () => void }) {
  const qc = useQueryClient();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [author, setAuthor] = useState(initial?.author ?? "MEENU COLLECTION");
  const [tagsCsv, setTagsCsv] = useState((initial?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo_description ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);

  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);

  const save = useMutation({
    mutationFn: () =>
      upsertBlogPost({
        data: {
          id: initial?.id,
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt || null,
          content,
          cover_image: coverImage || null,
          author: author || null,
          tags: tagsCsv.split(",").map((t) => t.trim()).filter(Boolean),
          seo_title: seoTitle || null,
          seo_description: seoDesc || null,
          published,
        },
      }),
    onSuccess: () => {
      setFieldError(null);
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["blog"] });
      onSaved();
    },
    onError: async (e: unknown) => {
      if (e instanceof Response && e.status === 409) {
        try {
          const body = await e.json();
          if (body?.field) { setFieldError(body); toast.error(body.message); return; }
        } catch { /* ignore */ }
      }
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('"field"')) {
        try {
          const parsed = JSON.parse(msg.slice(msg.indexOf("{"), msg.lastIndexOf("}") + 1));
          if (parsed?.field) { setFieldError(parsed); toast.error(parsed.message); return; }
        } catch { /* ignore */ }
      }
      toast.error(msg || "Save failed");
    },
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const compressed = await compressImage(files[0]);
      const path = `${Date.now()}-${compressed.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, compressed, {
        contentType: compressed.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setCoverImage(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function autoSlug(v: string) {
    if (!initial && !slug) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80));
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!title || !slug || !content) return toast.error("Title, slug, content zaroori hai"); save.mutate(); }}
      className="mt-6 space-y-4"
    >
      {fieldError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          <strong className="uppercase text-[11px] tracking-wider">{fieldError.field}:</strong> {fieldError.message}
        </div>
      )}
      <Field label="Title *">
        <input value={title} onChange={(e) => { setFieldError(null); setTitle(e.target.value); autoSlug(e.target.value); }} className={`${input} ${fieldError?.field === "title" ? "border-red-500 ring-1 ring-red-500" : ""}`} />
      </Field>
      <Field label="Slug * (lowercase, hyphens)">
        <input value={slug} onChange={(e) => { setFieldError(null); setSlug(e.target.value); }} className={`${input} ${fieldError?.field === "slug" ? "border-red-500 ring-1 ring-red-500" : ""}`} placeholder="cotton-bedsheet-care-guide" />
      </Field>
      <Field label="Excerpt (short summary, ~2 lines)">
        <textarea value={excerpt ?? ""} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={input} />
      </Field>

      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-secondary">Cover image</span>
        {coverImage && (
          <div className="relative mb-3 aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl bg-brand-soft/40 ring-1 ring-brand-primary/10">
            <img loading="lazy" decoding="async" src={coverImage} alt="Cover preview" className="h-full w-full object-cover" />
            <button type="button" onClick={() => setCoverImage("")} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 shadow-soft hover:bg-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium hover:bg-brand-soft/40">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading & compressing…" : "Upload image"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
          </label>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-white px-2">
            <LinkIcon className="h-4 w-4 text-brand-secondary/40" />
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="or paste image URL (https://…)" className="flex-1 bg-transparent py-2 text-sm outline-none" />
            <button type="button" onClick={() => { if (!urlInput) return; setCoverImage(urlInput.trim()); setUrlInput(""); }} className="rounded-md bg-brand-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">Use</button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Auto-compressed to WebP (near-lossless, ≤500 KB target). Alpha preserved for PNGs.</p>
      </div>

      <Field label="Content * (Markdown supported: **bold**, ##, lists, tables, links)">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} className={`${input} font-mono text-sm`} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author"><input value={author ?? ""} onChange={(e) => setAuthor(e.target.value)} className={input} /></Field>
        <Field label="Tags (comma separated)"><input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} className={input} placeholder="cotton, care, jaipur" /></Field>
      </div>
      <Field label="SEO title (optional override)"><input value={seoTitle ?? ""} onChange={(e) => setSeoTitle(e.target.value)} className={input} /></Field>
      <Field label="SEO description (optional override)"><textarea value={seoDesc ?? ""} onChange={(e) => setSeoDesc(e.target.value)} rows={2} className={input} /></Field>

      <label className="flex items-center gap-2 rounded-xl bg-brand-soft/40 p-3">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
        <span className="text-sm font-semibold text-brand-secondary">Published (public pr live)</span>
      </label>

      <button
        type="submit"
        disabled={save.isPending}
        className="inline-flex items-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
      >
        {save.isPending ? "Saving…" : "Save post"}
      </button>
    </form>
  );
}

const input = "w-full rounded-lg border border-input bg-white px-3 py-2 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-secondary">{label}</span>
      {children}
    </label>
  );
}
