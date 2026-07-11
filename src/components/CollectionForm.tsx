import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload } from "lucide-react";
import { saveCollection } from "@/lib/collections.functions";
import { listTopCollections } from "@/lib/collections.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";

type Value = {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  is_featured: boolean;
  sort_order: number;
};

const empty: Value = { slug: "", name: "", description: "", image_url: "", parent_id: null, is_featured: false, sort_order: 0 };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CollectionForm({ initial, onSaved }: { initial?: Partial<Value>; onSaved?: (id: string) => void }) {
  const [v, setV] = useState<Value>({ ...empty, ...initial });
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const tops = useQuery({ queryKey: ["collections", "top"], queryFn: () => listTopCollections() });

  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const mut = useMutation({
    mutationFn: (val: Value) => saveCollection({ data: val }),
    onSuccess: (r) => {
      setFieldError(null);
      toast.success("Collection saved");
      qc.invalidateQueries({ queryKey: ["collections"] });
      onSaved?.(r.id);
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
      const path = `${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("collection-images").upload(path, compressed);
      if (error) throw error;
      const { data } = supabase.storage.from("collection-images").getPublicUrl(path);
      setV((s) => ({ ...s, image_url: data.publicUrl }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!v.slug) return toast.error("Slug required");
    mut.mutate(v);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {fieldError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          <strong className="uppercase text-[11px] tracking-wider">{fieldError.field}:</strong> {fieldError.message}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Name</label>
          <input required className={`mt-1 w-full rounded-xl border ${fieldError?.field === "name" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.name} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, name: e.target.value, slug: s.slug || slugify(e.target.value) })); }} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Slug</label>
          <input required className={`mt-1 w-full rounded-xl border ${fieldError?.field === "slug" ? "border-red-500 ring-1 ring-red-500" : "border-input"} bg-background px-3 py-2 text-sm`} value={v.slug} onChange={(e) => { setFieldError(null); setV((s) => ({ ...s, slug: slugify(e.target.value) })); }} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Parent collection</label>
          <select className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.parent_id ?? ""} onChange={(e) => setV((s) => ({ ...s, parent_id: e.target.value || null }))}>
            <option value="">— None (top-level) —</option>
            {tops.data?.filter((c) => c.id !== v.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-brand-secondary">Sort order</label>
          <input type="number" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.sort_order} onChange={(e) => setV((s) => ({ ...s, sort_order: Number(e.target.value) }))} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Description</label>
        <textarea rows={3} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={v.description ?? ""} onChange={(e) => setV((s) => ({ ...s, description: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase text-brand-secondary">Image</label>
        {v.image_url && (
          <div className="relative mt-2 aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-gradient-to-br from-brand-soft/60 to-white ring-1 ring-brand-primary/10">
            <img loading="lazy" decoding="async" src={v.image_url} alt="" className="h-full w-full object-contain p-3" />
            <button type="button" onClick={() => setV((s) => ({ ...s, image_url: "" }))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1"><X className="h-3 w-3" /></button>
          </div>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">Cards show the full image (no cropping). Upload square/centered art for best results.</p>
        <div className="mt-2 flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e.target.files)} />
          </label>
          <input value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} placeholder="or paste URL" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <button type="button" className="rounded-xl bg-brand-primary px-4 text-sm text-primary-foreground" onClick={() => { if (imgUrlInput) { setV((s) => ({ ...s, image_url: imgUrlInput })); setImgUrlInput(""); } }}>Use</button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_featured} onChange={(e) => setV((s) => ({ ...s, is_featured: e.target.checked }))} /> Featured</label>
      <button type="submit" disabled={mut.isPending} className="rounded-full bg-brand-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
        {mut.isPending ? "Saving…" : "Save Collection"}
      </button>
    </form>
  );
}
