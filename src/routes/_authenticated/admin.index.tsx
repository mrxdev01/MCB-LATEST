import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, XCircle, Star, Sparkles, Award, Layers, FolderTree, Megaphone, PlusSquare, Rows3 } from "lucide-react";
import { getAdminDashboardStats } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/brand";
import { AdminVisitorPanel } from "@/components/admin/AdminVisitorPanel";


export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

type Stat = { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: string };

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => getAdminDashboardStats() });

  const stats: Stat[] = [
    { label: "Total Products", value: data?.products ?? 0, icon: Package, tone: "from-brand-primary to-rose-500" },
    { label: "Active (In stock)", value: data?.inStock ?? 0, icon: CheckCircle2, tone: "from-emerald-500 to-emerald-600" },
    { label: "Out of Stock", value: data?.outOfStock ?? 0, icon: XCircle, tone: "from-red-500 to-red-600" },
    { label: "Featured", value: data?.featured ?? 0, icon: Star, tone: "from-amber-500 to-amber-600" },
    { label: "New Arrivals", value: data?.newArrivals ?? 0, icon: Sparkles, tone: "from-sky-500 to-blue-600" },
    { label: "Bestsellers", value: data?.bestsellers ?? 0, icon: Award, tone: "from-fuchsia-500 to-purple-600" },
    { label: "Collections", value: data?.collections ?? 0, icon: Layers, tone: "from-teal-500 to-emerald-600" },
    { label: "Sub-categories", value: data?.subCategories ?? 0, icon: FolderTree, tone: "from-indigo-500 to-violet-600" },
    { label: "Announcements", value: data?.announcements ?? 0, icon: Megaphone, tone: "from-orange-500 to-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Overview</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Snapshot of your storefront.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/new" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-soft hover:-translate-y-0.5 transition"><PlusSquare className="h-3.5 w-3.5" /> Add product</Link>
          <Link to="/admin/bulk" className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-soft/60"><Rows3 className="h-3.5 w-3.5" /> Bulk add</Link>
          <Link to="/admin/collections" className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-soft/60"><Layers className="h-3.5 w-3.5" /> Collections</Link>
        </div>
      </header>

      <AdminVisitorPanel />



      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-soft ring-1 ring-brand-primary/10 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow-soft`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-secondary/60">{s.label}</p>
            <p className="mt-1 text-3xl font-black text-brand-secondary tabular-nums">{isLoading ? "—" : s.value.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-white shadow-soft ring-1 ring-brand-primary/10">
        <div className="flex items-center justify-between border-b border-brand-primary/10 px-5 py-4">
          <h2 className="text-lg font-black text-brand-secondary">Recent products</h2>
          <Link to="/admin/products" className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-brand-secondary/60">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).map((p) => {
                type R = typeof p & { product_images?: { url: string; sort_order: number }[] };
                const img = (p as R).product_images?.sort((a, b) => a.sort_order - b.sort_order)?.[0]?.url;
                const status = p.stock_status === "in_stock" ? "In stock" : p.stock_status === "out_of_stock" ? "Out of stock" : "Low stock";
                const tone = p.stock_status === "in_stock" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : p.stock_status === "out_of_stock" ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-700 ring-amber-200";
                return (
                  <tr key={p.id} className="border-t border-brand-primary/5">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {img ? <img loading="lazy" decoding="async" src={img} alt="" className="h-10 w-10 rounded-lg bg-brand-soft/40 object-contain p-1" /> : <div className="h-10 w-10 rounded-lg bg-brand-soft/60" />}
                        <span className="font-semibold text-brand-secondary">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.sku}</td>
                    <td className="px-5 py-3 font-semibold text-brand-secondary">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone}`}>{status}</span></td>
                  </tr>
                );
              })}
              {(!isLoading && (data?.recent ?? []).length === 0) && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No products yet. <Link to="/admin/new" className="text-brand-primary underline">Add your first product</Link>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
