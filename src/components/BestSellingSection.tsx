import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Award, ArrowRight } from "lucide-react";
import { listBestsellers } from "@/lib/products.functions";
import { formatPrice } from "@/lib/brand";
import { ikUrl, ikSrcSet } from "@/lib/img";
import { TagChip } from "./TagChip";

export const bestsellersQO = queryOptions({
  queryKey: ["products", "bestsellers"],
  queryFn: () => listBestsellers({ data: { limit: 12 } }),
});

type Img = { url: string; sort_order?: number };
type TagT = { label: string; color: string; text_color: string };
type Row = {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp?: number | null;
  stock_status?: string;
  product_images?: Img[];
  product_tags?: { tags: TagT }[];
};

export function BestSellingSection() {
  const { data } = useSuspenseQuery(bestsellersQO);
  const items = (data ?? []) as Row[];
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 content-auto">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_10%_0%,rgba(212,178,106,0.16),transparent_60%),radial-gradient(700px_400px_at_100%_100%,rgba(213,82,122,0.10),transparent_60%)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-900 shadow-soft ring-1 ring-amber-300/60 backdrop-blur">
              <Award className="h-3 w-3" /> Best Selling
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-brand-secondary sm:text-5xl">
              Everyone's{" "}
              <span className="relative inline-block text-brand-primary">
                Favourites
                <svg aria-hidden viewBox="0 0 220 10" className="absolute -bottom-1 left-0 h-2 w-full text-brand-primary/70" preserveAspectRatio="none">
                  <path d="M2 6 Q 60 1 120 5 T 218 3" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-brand-secondary/70">Handpicked bestsellers our customers keep coming back for.</p>
          </div>
          <Link to="/products" className="hidden items-center gap-2 rounded-full border border-brand-primary/25 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary shadow-soft hover:-translate-y-0.5 hover:shadow-lift sm:inline-flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Snap-scroll on mobile, grid on md+ */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {items.map((p) => {
            const img = p.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url;
            const tags = (p.product_tags ?? []).map((pt) => pt.tags).filter(Boolean);
            const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
            return (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group relative isolate block w-[74%] shrink-0 snap-start overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-brand-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-primary/30 sm:w-auto"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-brand-soft/40">
                  {img ? (
                    <img
                      src={ikUrl(img, 500)}
                      srcSet={ikSrcSet(img, [200, 400, 600, 800])}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 74vw"
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      width={500}
                      height={500}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-sm text-brand-primary/60">{p.title}</div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-secondary shadow-soft">
                    <Award className="h-3 w-3" /> Bestseller
                  </span>
                  {discount > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-primary px-2.5 py-0.5 text-[10px] font-black text-white shadow-soft">
                      -{discount}%
                    </span>
                  )}
                  {tags.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex max-w-[80%] flex-wrap gap-1">
                      {tags.slice(0, 3).map((t, i) => (
                        <TagChip key={i} tag={t} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-black text-brand-secondary sm:text-base">{p.title}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-black text-brand-primary">{formatPrice(p.price)}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary shadow-soft">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
