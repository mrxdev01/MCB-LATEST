import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { saveProduct } from "@/lib/admin.functions";
import { listCategories } from "@/lib/products.functions";
import { listCollections } from "@/lib/collections.functions";
import { importImageFromUrl } from "@/lib/image-import.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { PlacementPicker } from "@/components/PlacementPicker";
import { TagPicker } from "@/components/TagPicker";

type Row = { title: string; sku: string; images: string[]; urlInput?: string; status?: "pending" | "ok" | "err"; msg?: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function BulkProductForm() {
  const [shared, setShared] = useState({
    price: 0,
    mrp: null as number | null,
    category_id: null as string | null,
    description: "",
    sizes: [] as string[],
    tags: [] as string[],
    collection_ids: [] as string[],
    tag_ids: [] as string[],
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    stock_status: "in_stock",
  });
  const [rows, setRows] = useState<Row[]>([{ title: "", sku: "", images: [] }]);
  const [sizeInput, setSizeInput] = useState("");
  const [saving, setSaving] = useState(false);

  const cats = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const cols = useQuery({ queryKey: ["collections"], queryFn: () => listCollections() });

  const mut = useMutation({ mutationFn: (data: Record<string, unknown>) => saveProduct({ data: data as never }) });

  async function uploadRow(i: number, files: FileList | null) {
    if (!files?.length) return;
    const cur = rows[i];
    if (cur.images.length + files.length > 4) return toast.error("Max 4 images per row");
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const compressed = await compressImage(f);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${compressed.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, compressed);
      if (error) { toast.error(error.message); continue; }
      urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, images: [...r.images, ...urls].slice(0, 4) } : r)));
  }

  async function importRowUrl(i: number) {
    const url = rows[i].urlInput?.trim();
    if (!url) return;
    if (rows[i].images.length >= 4) return toast.error("Max 4 images");
    try {
      const { url: hosted } = await importImageFromUrl({ data: { url, bucket: "product-images" } });
      setRows((rs) => rs.map((r, j) => (j === i ? { ...r, images: [...r.images, hosted].slice(0, 4), urlInput: "" } : r)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.title || !r.sku || r.images.length === 0) {
        setRows((rs) => rs.map((row, j) => (j === i ? { ...row, status: "err", msg: "Missing title, SKU, or image" } : row)));
        continue;
      }
      setRows((rs) => rs.map((row, j) => (j === i ? { ...row, status: "pending" } : row)));
      try {
        await mut.mutateAsync({
          slug: `${slugify(r.title)}-${Math.random().toString(36).slice(2, 6)}`,
          title: r.title,
          sku: r.sku,
          price: shared.price,
          mrp: shared.mrp,
          category_id: shared.category_id,
          description: shared.description,
          short_description: null,
          sizes: shared.sizes,
          tags: shared.tags,
          seo_title: null,
          seo_description: null,
          stock_status: shared.stock_status,
          is_featured: shared.is_featured,
          is_bestseller: shared.is_bestseller,
          is_new_arrival: shared.is_new_arrival,
          images: r.images,
          collection_ids: shared.collection_ids,
          tag_ids: shared.tag_ids,
        });
        setRows((rs) => rs.map((row, j) => (j === i ? { ...row, status: "ok" } : row)));
      } catch (err) {
        setRows((rs) => rs.map((row, j) => (j === i ? { ...row, status: "err", msg: err instanceof Error ? err.message : "Error" } : row)));
      }
    }
    setSaving(false);
    toast.success("Bulk save finished");
  }


  return (
    <form onSubmit={submit} className="space-y-8">
      <PlacementPicker
        categories={cats.data ?? []}
        collections={cols.data ?? []}
        categoryId={shared.category_id}
        collectionIds={shared.collection_ids}
        onCategoryChange={(id) => setShared((s) => ({ ...s, category_id: id }))}
        onCollectionsChange={(ids) => setShared((s) => ({ ...s, collection_ids: ids }))}
      />

      <section className="rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-secondary">Shared fields</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase">Price (₹)</label>
            <input type="number" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={shared.price} onChange={(e) => setShared((s) => ({ ...s, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase">MRP</label>
            <input type="number" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={shared.mrp ?? ""} onChange={(e) => setShared((s) => ({ ...s, mrp: e.target.value ? Number(e.target.value) : null }))} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase">Stock</label>
            <select className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={shared.stock_status} onChange={(e) => setShared((s) => ({ ...s, stock_status: e.target.value }))}>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase">Description</label>
          <textarea rows={3} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={shared.description} onChange={(e) => setShared((s) => ({ ...s, description: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase">Sizes</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {shared.sizes.map((sz) => (
              <span key={sz} className="rounded-full bg-brand-soft px-3 py-1 text-xs">{sz} <button type="button" onClick={() => setShared((s) => ({ ...s, sizes: s.sizes.filter((x) => x !== sz) }))}>×</button></span>
            ))}
            <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} className="rounded-full border border-input px-3 py-1 text-xs" placeholder="Add size" />
            <button type="button" onClick={() => { if (sizeInput) { setShared((s) => ({ ...s, sizes: [...s.sizes, sizeInput] })); setSizeInput(""); } }} className="rounded-full bg-brand-primary px-3 py-1 text-xs text-primary-foreground">Add</button>
          </div>
        </div>
        <div className="mt-4">
          <TagPicker scope="product" value={shared.tag_ids} onChange={(ids) => setShared((s) => ({ ...s, tag_ids: ids }))} />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <label className="text-sm"><input type="checkbox" checked={shared.is_featured} onChange={(e) => setShared((s) => ({ ...s, is_featured: e.target.checked }))} /> Featured</label>
          <label className="text-sm"><input type="checkbox" checked={shared.is_bestseller} onChange={(e) => setShared((s) => ({ ...s, is_bestseller: e.target.checked }))} /> Bestseller</label>
          <label className="text-sm"><input type="checkbox" checked={shared.is_new_arrival} onChange={(e) => setShared((s) => ({ ...s, is_new_arrival: e.target.checked }))} /> New</label>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-secondary">Products</h2>
          <button type="button" onClick={() => setRows((r) => [...r, { title: "", sku: "", images: [] }])} className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-4 py-2 text-xs text-primary-foreground"><Plus className="h-3 w-3" /> Add row</button>
        </div>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-border p-3">
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center">
                <input placeholder="Title" value={r.title} onChange={(e) => setRows((rs) => rs.map((row, j) => (j === i ? { ...row, title: e.target.value } : row)))} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                <input placeholder="SKU" value={r.sku} onChange={(e) => setRows((rs) => rs.map((row, j) => (j === i ? { ...row, sku: e.target.value } : row)))} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="justify-self-end text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.images.map((u, k) => <img loading="lazy" decoding="async" key={k} src={u} alt="" className="h-12 w-12 rounded-lg bg-brand-soft/40 object-contain p-1" />)}
                {r.images.length < 4 && (
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-input px-3 py-1 text-xs"><Upload className="h-3 w-3" /> Upload<input type="file" accept="image/*" multiple hidden onChange={(e) => uploadRow(i, e.target.files)} /></label>
                )}
                <div className="inline-flex items-center gap-1 rounded-full border border-input px-2 py-0.5 text-xs">
                  <LinkIcon className="h-3 w-3 text-brand-primary" />
                  <input value={r.urlInput ?? ""} onChange={(e) => setRows((rs) => rs.map((row, j) => (j === i ? { ...row, urlInput: e.target.value } : row)))} placeholder="Image URL" className="w-40 bg-transparent focus:outline-none" />
                  <button type="button" onClick={() => importRowUrl(i)} className="text-brand-primary hover:underline">import</button>
                </div>
                {r.status === "ok" && <span className="text-xs text-green-600">✓ saved</span>}
                {r.status === "err" && <span className="text-xs text-destructive">✗ {r.msg}</span>}
                {r.status === "pending" && <span className="text-xs text-muted-foreground">…</span>}
              </div>
            </div>
          ))}
        </div>
      </section>


      <button type="submit" disabled={saving} className="rounded-full bg-brand-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
        {saving ? "Saving…" : `Save ${rows.length} Products`}
      </button>
    </form>
  );
}
