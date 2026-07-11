import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle, ShoppingBag, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Gallery } from "@/components/Gallery";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, relatedProducts } from "@/lib/products.functions";
import { getReviewSummary } from "@/lib/reviews.functions";
import { formatPrice } from "@/lib/brand";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { ProductReviews, ReviewSummaryBadge } from "@/components/ProductReviews";
import { ProductDescription } from "@/components/ProductDescription";


const qo = (slug: string) =>
  queryOptions({
    queryKey: ["products", "slug", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

const reviewSummaryQo = (productId: string) =>
  queryOptions({
    queryKey: ["review-summary", productId],
    queryFn: () => getReviewSummary({ data: { productId } }),
  });

export const Route = createFileRoute("/products/$slug")({
  head: (ctx) => {
    const p = (ctx as { loaderData?: { product?: { id?: string; title?: string; slug?: string; sku?: string; price?: number | string; mrp?: number | string | null; short_description?: string | null; seo_description?: string | null; description?: string | null; product_images?: { url: string }[] | null }; reviewSummary?: { average: number; count: number } } }).loaderData?.product;
    const rs = (ctx as { loaderData?: { reviewSummary?: { average: number; count: number } } }).loaderData?.reviewSummary;
    const title = p?.title ? `${p.title} — MEENU COLLECTION` : "Product — MEENU COLLECTION";
    const desc = p?.seo_description ?? p?.short_description ?? "Premium cotton product from MEENU COLLECTION Jaipur.";
    const img = p?.product_images?.[0]?.url;
    const url = p?.slug ? `https://meenucollection.in/products/${p.slug}` : "https://meenucollection.in";
    const productLd: Record<string, unknown> | null = p ? {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.title,
      description: desc,
      image: p.product_images?.map((i) => i.url) ?? [],
      sku: p.sku,
      brand: { "@type": "Brand", name: "MEENU COLLECTION" },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "INR",
        price: String(p.price ?? ""),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "MEENU COLLECTION" },
      },
    } : null;
    if (productLd && rs && rs.count > 0) {
      productLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: String(rs.average),
        reviewCount: String(rs.count),
        bestRating: "5",
        worstRating: "1",
      };
    }
    const scripts = p ? [
      {
        type: "application/ld+json" as const,
        children: JSON.stringify(productLd),
      },
      {
        type: "application/ld+json" as const,
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
            { "@type": "ListItem", position: 2, name: "Products", item: "https://meenucollection.in/products" },
            { "@type": "ListItem", position: 3, name: p.title, item: url },
          ],
        }),
      },
    ] : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(img ? [{ property: "og:image" as const, content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!product) throw notFound();
    const reviewSummary = await context.queryClient.ensureQueryData(reviewSummaryQo(product.id));
    return { product, reviewSummary };
  },
  component: ProductPage,
  pendingComponent: ProductDetailSkeleton,
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>Product not found.</p>
      <Link to="/products" className="text-brand-primary underline">Browse all products</Link>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(qo(slug));
  const { data: related } = useSuspenseQuery(
    queryOptions({
      queryKey: ["related", product?.id, product?.category_id],
      queryFn: () => relatedProducts({ data: { productId: product!.id, categoryId: product!.category_id } }),
      enabled: !!product,
    }),
  );
  const { add } = useCart();
  const sizes = (product?.sizes as string[] | null) ?? [];
  const [size, setSize] = useState<string | undefined>(sizes[0]);

  if (!product) return null;

  const firstImg = product.product_images?.[0]?.url;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-brand-primary">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-secondary">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <Gallery images={product.product_images ?? []} alt={product.title} />
          <div>
            <h1 className="text-3xl font-bold text-brand-secondary sm:text-4xl">{product.title}</h1>
            <ReviewSummaryBadge productId={product.id} />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl font-bold text-brand-primary">{formatPrice(product.price)}</span>
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
              )}
            </div>
            {product.short_description && (
              <p className="mt-4 text-base text-muted-foreground">{product.short_description}</p>
            )}
            {sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                        size === s
                          ? "border-brand-primary bg-brand-primary text-primary-foreground"
                          : "border-input bg-card text-brand-secondary hover:border-brand-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={productEnquiryUrl({ title: product.title, slug: product.slug, price: product.price, sku: product.sku }, size)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
              </a>
              <button
                onClick={() => {
                  add({
                    id: product.id,
                    slug: product.slug,
                    title: product.title,
                    price: Number(product.price),
                    qty: 1,
                    size,
                    image: firstImg,
                  });
                  toast.success("Added to cart");
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
            </div>

            {product.description && (
              <div className="mt-8">
                <ProductDescription text={product.description} />
              </div>
            )}

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-soft/70 bg-white/70 px-3 py-1.5 text-[11px] font-medium tracking-wide text-brand-secondary/70 shadow-sm">
              <span className="text-muted-foreground">SKU</span>
              <span className="h-3 w-px bg-brand-soft" />
              <span className="font-mono text-brand-secondary">{product.sku}</span>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} />



        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-brand-secondary">You may also like</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
