import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Edit, PlusSquare, Rows3, Search, Award } from "lucide-react";
import { useMemo, useState } from "react";
import { listAllProductsAdmin, deleteProduct, toggleBestseller } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/brand";
import { TableRowSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "products"], queryFn: () => listAllProductsAdmin() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "bestsellers" | "featured" | "out_of_stock">("all");

  const del = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const bs = useMutation({
    mutationFn: (v: { id: string; is_bestseller: boolean }) => toggleBestseller({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter === "bestsellers") list = list.filter((p) => p.is_bestseller);
    if (filter === "featured") list = list.filter((p) => p.is_featured);
    if (filter === "out_of_stock") list = list.filter((p) => p.stock_status === "out_of_stock");
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
    }
    return list;
  }, [data, q, filter]);

  const chip = (v: typeof filter, label: string) => (
    <button
      onClick={() => setFilter(v)}
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${filter === v ? "bg-brand-primary text-primary-foreground shadow-soft" : "bg-white text-brand-secondary/70 ring-1 ring-brand-primary/15 hover:text-brand-primary"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Catalog</p>
          <h1 className="mt-1 text-3xl font-black text-brand-secondary">Products</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/bulk" className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-soft/60"><Rows3 className="h-3.5 w-3.5" /> Bulk add</Link>
          <Link to="/admin/new" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-soft"><PlusSquare className="h-3.5 w-3.5" /> Add product</Link>
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-brand-primary/10">
        <Search className="ml-2 h-4 w-4 text-brand-primary" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or SKU" className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none" />
      </div>

      <div className="flex flex-wrap gap-2">
        {chip("all", `All (${data?.length ?? 0})`)}
        {chip("bestsellers", `Bestsellers (${(data ?? []).filter((p) => p.is_bestseller).length})`)}
        {chip("featured", "Featured")}
        {chip("out_of_stock", "Out of stock")}
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-brand-primary/10">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!isLoading && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-brand-primary/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-soft/40 text-left text-[10px] uppercase tracking-wider text-brand-secondary/70">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Bestseller</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  type R = typeof p & { product_images?: { url: string; sort_order?: number }[]; categories?: { name: string } };
                  const row = p as R;
                  const img = row.product_images?.[0]?.url;
                  return (
                    <tr key={p.id} className="border-t border-brand-primary/5 hover:bg-brand-soft/20">
                      <td className="px-4 py-2">{img ? <img loading="lazy" decoding="async" src={img} alt="" className="h-12 w-12 rounded-lg bg-brand-soft/40 object-contain p-1" /> : <div className="h-12 w-12 rounded-lg bg-brand-soft/60" />}</td>
                      <td className="px-4 py-2 font-semibold text-brand-secondary">{p.title}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-2 font-semibold">{formatPrice(p.price)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.categories?.name ?? "—"}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => bs.mutate({ id: p.id, is_bestseller: !p.is_bestseller })}
                          title={p.is_bestseller ? "Remove from bestsellers" : "Mark bestseller"}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${p.is_bestseller ? "bg-amber-400 text-brand-secondary shadow-soft" : "bg-brand-soft text-brand-secondary/60 hover:bg-amber-100"}`}
                        >
                          <Award className="h-3 w-3" /> {p.is_bestseller ? "On" : "Off"}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Link to="/admin/edit/$id" params={{ id: p.id }} className="rounded-full bg-brand-soft p-2 text-brand-primary hover:bg-brand-primary hover:text-white"><Edit className="h-3.5 w-3.5" /></Link>
                          <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }} className="rounded-full bg-destructive/10 p-2 text-destructive hover:bg-destructive hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
