import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { getCollectionBySlug } from "@/lib/collections.functions";
import { ListingPageSkeleton } from "@/components/skeletons";
import { ikUrl, ikSrcSet } from "@/lib/img";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["collections", "slug", slug],
    queryFn: () => getCollectionBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/collections/$slug")({
  head: (ctx) => {
    const c = (ctx as { loaderData?: { collection?: { name?: string; slug?: string; description?: string | null; image_url?: string | null; products?: { slug: string; title: string }[] } } }).loaderData?.collection;
    const title = c?.name ? `${c.name} — Buy Online at Wholesale Price | MEENU COLLECTION Jaipur` : "Collection";
    const desc = c?.description ?? (c?.name ? `Shop ${c.name} from MEENU COLLECTION Jaipur. Premium pure cotton, honest wholesale + retail prices, pan-India delivery.` : "Explore this collection from MEENU COLLECTION.");
    const url = c?.slug ? `https://meenucollection.in/collections/${c.slug}` : "https://meenucollection.in";
    const items = (c?.products ?? []).slice(0, 20);
    const scripts = c ? [
      {
        type: "application/ld+json" as const,
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
            { "@type": "ListItem", position: 2, name: c.name, item: url },
          ],
        }),
      },
      ...(items.length > 0 ? [{
        type: "application/ld+json" as const,
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: c.name,
          itemListElement: items.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://meenucollection.in/products/${p.slug}`,
            name: p.title,
          })),
        }),
      }] : []),
    ] : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        ...(c?.image_url ? [{ property: "og:image" as const, content: c.image_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  loader: async ({ params, context }) => {
    const collection = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!collection) throw notFound();
    return { collection };
  },
  component: CollectionPage,
  pendingComponent: () => <ListingPageSkeleton variant="category" count={8} />,
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>Collection not found.</p>
      <Link to="/" className="text-brand-primary underline">Go home</Link>
    </div>
  ),
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data: collection } = useSuspenseQuery(qo(slug));
  if (!collection) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-secondary">{collection.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-brand-secondary sm:text-4xl">{collection.name}</h1>
        {collection.description && (
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">{collection.description}</p>
        )}

        {collection.children.length > 0 ? (
          <>
            <h2 className="mt-10 text-xl font-bold text-brand-secondary">Shop by Type</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {collection.children.map((c) => (
                <Link
                  key={c.id}
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="card-hover card-hover-hover block overflow-hidden rounded-3xl bg-card shadow-soft"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-soft/60 to-white">
                    {c.image_url && (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={ikUrl(c.image_url, 500)}
                        srcSet={ikSrcSet(c.image_url, [200, 400, 600, 800])}
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
                        width={500}
                        height={500}
                        alt={c.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4"><h3 className="font-semibold text-brand-secondary">{c.name}</h3></div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {collection.products.map((p) => (
              <ProductCard key={p.id as string} product={p as never} />
            ))}
            {collection.products.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">No products in this collection yet.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
