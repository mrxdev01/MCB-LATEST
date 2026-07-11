import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Plus, Link as LinkIcon } from "lucide-react";
import { saveProduct } from "@/lib/admin.functions";
import { listCategories } from "@/lib/products.functions";
import { listCollections } from "@/lib/collections.functions";
import { importImageFromUrl } from "@/lib/image-import.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { PlacementPicker } from "@/components/PlacementPicker";
import { TagPicker } from "@/components/TagPicker";

export type ProductFormValue = {
  id?: string;
  slug: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  mrp?: number | null;
  sku: string;
  stock_status: string;
  category_id?: string | null;
  sizes: string[];
  tags: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  images: string[];
  collection_ids: string[];
  tag_ids: string[];
};

const empty: ProductFormValue = {
  slug: "",
  title: "",
  short_description: "",
  description: "",
  price: 0,
  mrp: null,
  sku: "",
  stock_status: "in_stock",
  category_id: null,
  sizes: [],
  tags: [],
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  images: [],
  collection_ids: [],
  tag_ids: [],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ initial, onSaved }: { initial?: Partial<ProductFormValue>; onSaved?: (id: string) => void }) {
  const [v, setV] = useState<ProductFormValue>({ ...empty, ...initial });
  const [sizeInput, setSizeInput] = useState("");
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const qc = useQueryClient();

  const cats = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const cols = useQuery({ queryKey: ["collections"], queryFn: () => listCollections() });

  const mut = useMutation({
    mutationFn: (val: ProductFormValue) => saveProduct({ data: val }),
    onSuccess: (r) => {
      setFieldError(null);
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      onSaved?.(r.id);
    },
    onError: async (e: unknown) => {
      // Server returns 409 with JSON { field, message } for uniqueness conflicts
      if (e instanceof Response && e.status === 409) {
        try {
          const body = await e.json();
          if (body?.field && body?.message) {
            setFieldError({ field: body.field, message: body.message });
            toast.error(body.message);
            return;
          }
        } catch { /* fall through */ }
      }
      const msg = e instanceof Error ? e.message : String(e);
      // TanStack sometimes surfaces the raw response text
      if (msg.includes("already use") || msg.includes('"field"')) {
        try {
          const parsed = JSON.parse(msg.slice(msg.indexOf("{"), msg.lastIndexOf("}") + 1));
          if (parsed?.field) { setFieldError(parsed); toast.error(parsed.message); return; }
        } catch { /* ignore */ }
      }
      toast.error(msg || "Save failed");
    },
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    if (v.images.length + files.length > 4) return toast.error("Max 4 images");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const compressed = await compressImage(f);
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${compressed.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, compressed, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setV((s) => ({ ...s, images: [...s.images, ...urls].slice(0, 4) }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleImportUrl() {
    const url = imgUrlInput.trim();
    if (!url) return;
    if (v.images.length >= 4) return toast.error("Max 4 images");
    setImporting(true);
    try {
      const { url: hosted } = await importImageFromUrl({ data: { url, bucket: "product-images" } });
      setV((s) => ({ ...s, images: [...s.images, hosted].slice(0, 4) }));
      setImgUrlInput("");
      toast.success("Image imported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (v.images.length === 0) return toast.error("Add at least 1 image");
    if (!v.slug) return toast.error("Slug required");
    if (!v.category_id && v.collection_ids.length === 0) {
      if (!confirm("This product has no category or collection. Shoppers won't see it in the menu. Save anyway?")) return;
    }
    mut.mutate({
      ...v,
      price: Number(v.price),
      mrp: v.mrp ? Number(v.mrp) : null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* PROMINENT PLACEMENT PICKER — first thing admin sees */}
      <PlacementPicker
        categories={cats.data ?? []}
        collections={cols.data ?? []}
        categoryId={v.category_id ?? null}
        collectionIds={v.collection_ids}
        onCategoryChange={(id) => setV((s) => ({ ...s, category_id: id }))}
        onCollectionsChange={(ids) => setV((s) => ({ ...s, collection_ids: ids }))}
      />

      {fieldError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          <strong className="uppercase text-[11px] tracking-wider">{fieldError.field}:</strong> {fieldError.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Title</label>
          <input
            className={`mt-1 w-full rounded-xl border ${fieldError?.field === "title" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`}
            value={v.title}
            onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, title: e.target.value, slug: s.slug || slugify(e.target.value) })); }}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Slug</label>
          <input className={`mt-1 w-full rounded-xl border ${fieldError?.field === "slug" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.slug} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, slug: slugify(e.target.value) })); }} required />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">SKU</label>
          <input className={`mt-1 w-full rounded-xl border ${fieldError?.field === "sku" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.sku} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, sku: e.target.value })); }} required />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Price (₹)</label>
          <input type="number" step="0.01" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.price} onChange={(e) => setV((s) => ({ ...s, price: Number(e.target.value) }))} required />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">MRP (₹)</label>
          <input type="number" step="0.01" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.mrp ?? ""} onChange={(e) => setV((s) => ({ ...s, mrp: e.target.value ? Number(e.target.value) : null }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Stock</label>
          <select className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.stock_status} onChange={(e) => setV((s) => ({ ...s, stock_status: e.target.value }))}>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Short description</label>
        <input className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.short_description ?? ""} onChange={(e) => setV((s) => ({ ...s, short_description: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Description</label>
        <textarea rows={4} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.description ?? ""} onChange={(e) => setV((s) => ({ ...s, description: e.target.value }))} />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Sizes</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {v.sizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs text-brand-secondary">
              {s}
              <button type="button" onClick={() => setV((st) => ({ ...st, sizes: st.sizes.filter((x) => x !== s) }))}><X className="h-3 w-3" /></button>
            </span>
          ))}
          <div className="flex gap-1">
            <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="e.g. King" className="rounded-full border border-input bg-background px-3 py-1 text-xs" />
            <button type="button" className="rounded-full bg-brand-primary px-3 py-1 text-xs text-primary-foreground" onClick={() => { if (sizeInput) { setV((s) => ({ ...s, sizes: [...s.sizes, sizeInput] })); setSizeInput(""); } }}>Add</button>
          </div>
        </div>
      </div>

      {/* CUSTOM TAGS */}
      <TagPicker scope="product" value={v.tag_ids} onChange={(ids) => setV((s) => ({ ...s, tag_ids: ids }))} />

      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Images (1–4)</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {v.images.map((url, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-brand-soft">
              <img loading="lazy" decoding="async" src={url} alt="" className="h-full w-full object-contain p-1" />
              <button type="button" onClick={() => setV((s) => ({ ...s, images: s.images.filter((_, j) => j !== i) }))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1"><X className="h-3 w-3" /></button>
            </div>
          ))}
          {v.images.length < 4 && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-input text-muted-foreground">
              <input type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
              {uploading ? <span className="text-xs">Uploading…</span> : <Upload className="h-6 w-6" />}
            </label>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Images are compressed near-losslessly (WebP q=0.92, max 2400 px). Original quality preserved.</p>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-primary" />
            <input value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} placeholder="Paste image URL to import" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm" />
          </div>
          <button type="button" disabled={importing || !imgUrlInput} onClick={handleImportUrl} className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
            {importing ? "Importing…" : <><Plus className="h-4 w-4" /> Import</>}
          </button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_featured} onChange={(e) => setV((s) => ({ ...s, is_featured: e.target.checked }))} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_bestseller} onChange={(e) => setV((s) => ({ ...s, is_bestseller: e.target.checked }))} /> Bestseller</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_new_arrival} onChange={(e) => setV((s) => ({ ...s, is_new_arrival: e.target.checked }))} /> New Arrival</label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">SEO title</label>
          <input className={`mt-1 w-full rounded-xl border ${fieldError?.field === "seo_title" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.seo_title ?? ""} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, seo_title: e.target.value })); }} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">SEO description</label>
          <input className={`mt-1 w-full rounded-xl border ${fieldError?.field === "seo_description" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.seo_description ?? ""} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, seo_description: e.target.value })); }} />
        </div>
      </div>

      <button type="submit" disabled={mut.isPending} className="rounded-full bg-brand-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60">
        {mut.isPending ? "Saving…" : "Save Product"}
      </button>
    </form>
  );
}
