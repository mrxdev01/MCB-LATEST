import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/brand";
import { ikUrl, ikSrcSet } from "@/lib/img";
import { TagChip } from "./TagChip";

type Img = { url: string; sort_order?: number };
type TagRel = { tags: { label: string; color: string; text_color: string } | null };
type ProductCardProduct = {
  slug: string;
  title: string;
  price: number;
  mrp?: number | null;
  stock_status?: string;
  is_bestseller?: boolean;
  product_images?: Img[] | null;
  product_tags?: TagRel[] | null;
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const img =
    product.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ??
    "https://placehold.co/600x600/f7d9e3/d5527a?text=No+Image";
  const tags = (product.product_tags ?? []).map((r) => r.tags).filter(Boolean) as { label: string; color: string; text_color: string }[];
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="card-hover card-hover-hover group block overflow-hidden rounded-3xl bg-card shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-soft/40">
        <img
          src={ikUrl(img, 500)}
          srcSet={ikSrcSet(img, [200, 400, 600, 800])}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
          alt={product.title}
          loading="lazy"
          decoding="async"
          width={500}
          height={500}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-primary px-2.5 py-0.5 text-[10px] font-black text-white shadow-soft">-{discount}%</span>
        )}
        {tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex max-w-[85%] flex-wrap gap-1">
            {tags.slice(0, 3).map((t, i) => (
              <TagChip key={i} tag={t} />
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-brand-secondary">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-brand-primary">{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[11px] text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
          {product.stock_status === "in_stock" && (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-primary">
              In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
