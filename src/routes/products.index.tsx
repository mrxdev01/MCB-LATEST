import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import { ListingPageSkeleton } from "@/components/skeletons";
import { canonical } from "@/lib/seo";

const allProductsQO = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/products/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "All Products — MEENU COLLECTION" },
      { name: "description", content: "Browse all premium cotton bedsheets, shirts and nighty from MEENU COLLECTION Jaipur." },
      { property: "og:title", content: "All Products — MEENU COLLECTION" },
      { property: "og:description", content: "Browse all premium cotton products." },
    ],
    links: [{ rel: "canonical", href: canonical("/products") }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQO),
  component: AllProducts,
  pendingComponent: () => <ListingPageSkeleton count={12} />,
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function AllProducts() {
  const { data: products } = useSuspenseQuery(allProductsQO);
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  useEffect(() => {
    setQ(initialQ ?? "");
  }, [initialQ]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        (p.description ?? "").toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s),
    );
  }, [products, q]);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-brand-secondary sm:text-4xl">All Products</h1>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, SKU, keywords…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            No products found. <Link to="/" className="text-brand-primary underline">Go home</Link>.
          </p>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
