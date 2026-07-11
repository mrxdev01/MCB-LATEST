import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Edit, Plus, FolderTree, Package2, ChevronDown, ChevronRight, Search, X, Check, CheckSquare, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { listCollections, deleteCollection, setCollectionProducts } from "@/lib/collections.functions";
import { listAllProductsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/collections/")({
  component: AdminCollections,
});

type Col = { id: string; name: string; slug: string; parent_id: string | null; is_featured: boolean; image_url: string | null; sort_order: number; description: string | null };

function AdminCollections() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["collections"], queryFn: () => listCollections() });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [managing, setManaging] = useState<Col | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteCollection({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["collections"] }); qc.invalidateQueries({ queryKey: ["admin", "dashboard"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const cols = (data as Col[] | undefined) ?? [];
  const roots = cols.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => cols.filter((c) => c.parent_id === id);

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Catalog</p>
          <h1 className="mt-1 text-3xl font-black text-brand-secondary">Collections & Sub-categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create top-level collections, add sub-categories inside them, and assign products.</p>
        </div>
        <Link to="/admin/collections/new" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-soft"><Plus className="h-3.5 w-3.5" /> New collection</Link>
      </header>

      <div className="space-y-3">
        {roots.map((c) => {
          const kids = childrenOf(c.id);
          const isOpen = expanded[c.id] ?? true;
          return (
            <div key={c.id} className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-brand-primary/10">
              <div className="flex items-center gap-3 p-3">
                <button onClick={() => toggle(c.id)} className="rounded-lg p-1 text-brand-primary hover:bg-brand-soft/60" aria-label="Toggle">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-soft/60 to-white ring-1 ring-brand-primary/10">
                  {c.image_url ? <img loading="lazy" decoding="async" src={c.image_url} alt="" className="h-full w-full object-contain p-1" /> : <FolderTree className="h-5 w-5 text-brand-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-brand-secondary">{c.name} {c.is_featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Featured</span>}</p>
                  <p className="truncate text-[11px] text-muted-foreground">/{c.slug} · {kids.length} sub-{kids.length === 1 ? "category" : "categories"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link to="/admin/collections/new" search={{ parent: c.id }} className="inline-flex items-center gap-1 rounded-full bg-brand-soft/70 px-3 py-1.5 text-[11px] font-bold text-brand-primary hover:bg-brand-primary hover:text-white"><Plus className="h-3 w-3" /> Sub-category</Link>
                  <button onClick={() => setManaging(c)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft/70 px-3 py-1.5 text-[11px] font-bold text-brand-primary hover:bg-brand-primary hover:text-white"><Package2 className="h-3 w-3" /> Products</button>
                  <Link to="/admin/collections/edit/$id" params={{ id: c.id }} className="rounded-full bg-brand-soft/70 p-2 text-brand-primary hover:bg-brand-primary hover:text-white"><Edit className="h-3.5 w-3.5" /></Link>
                  <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }} className="rounded-full bg-destructive/10 p-2 text-destructive hover:bg-destructive hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {isOpen && kids.length > 0 && (
                <div className="border-t border-brand-primary/10 bg-brand-soft/20 px-3 py-2">
                  <ul className="divide-y divide-brand-primary/10">
                    {kids.map((k) => (
                      <li key={k.id} className="flex items-center gap-3 py-2">
                        <div className="ml-8 grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-brand-primary/10">
                          {k.image_url ? <img loading="lazy" decoding="async" src={k.image_url} alt="" className="h-full w-full object-contain p-1" /> : <FolderTree className="h-4 w-4 text-brand-primary/60" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-secondary">{k.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">/{k.slug}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button onClick={() => setManaging(k)} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand-primary ring-1 ring-brand-primary/20 hover:bg-brand-primary hover:text-white hover:ring-brand-primary"><Package2 className="h-3 w-3" /> Products</button>
                          <Link to="/admin/collections/edit/$id" params={{ id: k.id }} className="rounded-full bg-white p-1.5 text-brand-primary ring-1 ring-brand-primary/20 hover:bg-brand-primary hover:text-white hover:ring-brand-primary"><Edit className="h-3 w-3" /></Link>
                          <button onClick={() => { if (confirm(`Delete "${k.name}"?`)) del.mutate(k.id); }} className="rounded-full bg-white p-1.5 text-destructive ring-1 ring-destructive/20 hover:bg-destructive hover:text-white hover:ring-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {roots.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-soft ring-1 ring-brand-primary/10">
            <FolderTree className="mx-auto h-8 w-8 text-brand-primary" />
            <p className="mt-3 text-sm text-muted-foreground">No collections yet.</p>
            <Link to="/admin/collections/new" className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground">Create your first collection</Link>
          </div>
        )}
      </div>

      {managing && <ManageProductsModal collection={managing} onClose={() => setManaging(null)} />}
    </div>
  );
}

function ManageProductsModal({ collection, onClose }: { collection: Col; onClose: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: products, isLoading } = useQuery({ queryKey: ["admin", "products"], queryFn: () => listAllProductsAdmin() });

  // Fetch current membership by scanning products' collection membership via extra query
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const membership = useQuery({
    queryKey: ["collection", "products", collection.id],
    queryFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from("product_collections").select("product_id").eq("collection_id", collection.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.product_id as string);
    },
  });

  // initialise selection once
  if (selected === null && membership.data) {
    setSelected(new Set(membership.data));
  }
  const sel = selected ?? new Set<string>();

  const filtered = useMemo(() => {
    const list = products ?? [];
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((p) => p.title.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
  }, [products, q]);

  const toggle = (id: string) => {
    const next = new Set(sel);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(sel);
    filtered.forEach((p) => next.add(p.id as string));
    setSelected(next);
  };
  const clearAllFiltered = () => {
    const next = new Set(sel);
    filtered.forEach((p) => next.delete(p.id as string));
    setSelected(next);
  };

  const save = useMutation({
    mutationFn: () => setCollectionProducts({ data: { collectionId: collection.id, productIds: Array.from(sel) } }),
    onSuccess: () => {
      toast.success(`${sel.size} product${sel.size === 1 ? "" : "s"} assigned to "${collection.name}"`);
      qc.invalidateQueries({ queryKey: ["collection", "products", collection.id] });
      qc.invalidateQueries({ queryKey: ["collections"] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-primary/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Manage products in</p>
            <h2 className="text-lg font-black text-brand-secondary">{collection.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-brand-secondary/70 hover:bg-brand-soft/60"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-brand-primary/10 bg-brand-soft/20 px-5 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-brand-primary/15">
            <Search className="h-4 w-4 text-brand-primary" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <button onClick={selectAllFiltered} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-brand-primary ring-1 ring-brand-primary/20 hover:bg-brand-primary hover:text-white"><CheckSquare className="h-3 w-3" /> Select filtered</button>
          <button onClick={clearAllFiltered} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-brand-secondary/80 ring-1 ring-brand-primary/20 hover:bg-brand-soft/70"><Square className="h-3 w-3" /> Clear filtered</button>
          <span className="ml-auto text-[11px] font-bold text-brand-secondary/70">{sel.size} selected</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {(isLoading || membership.isLoading) ? (
            <p className="p-5 text-center text-muted-foreground">Loading…</p>
          ) : (
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {filtered.map((p) => {
                type R = typeof p & { product_images?: { url: string; sort_order?: number }[] };
                const img = (p as R).product_images?.[0]?.url;
                const on = sel.has(p.id as string);
                return (
                  <li key={p.id as string}>
                    <button
                      onClick={() => toggle(p.id as string)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${on ? "border-brand-primary bg-brand-primary/10" : "border-brand-primary/10 bg-white hover:bg-brand-soft/40"}`}
                    >
                      {img ? <img loading="lazy" decoding="async" src={img} alt="" className="h-10 w-10 rounded-lg bg-brand-soft/40 object-contain p-1" /> : <div className="h-10 w-10 rounded-lg bg-brand-soft/60" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-secondary">{p.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{p.sku}</p>
                      </div>
                      {on && <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-primary text-white"><Check className="h-3.5 w-3.5" /></div>}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && <li className="col-span-full py-10 text-center text-muted-foreground">No products.</li>}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-brand-primary/10 bg-white px-5 py-3">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-secondary/80 hover:bg-brand-soft/60">Cancel</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-brand-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60">
            {save.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
