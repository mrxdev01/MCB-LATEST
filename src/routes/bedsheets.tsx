import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { RelatedCategories } from "@/components/RelatedCategories";
import { listProducts } from "@/lib/products.functions";
import { ListingPageSkeleton } from "@/components/skeletons";

const SLUG = "bedsheets";
const META = {
  title: "Pure Cotton Bedsheets Online — King, Queen, Single Size | MEENU COLLECTION Jaipur",
  description: "Buy premium pure cotton bedsheets online in India. King, Queen, Double & Single sizes with pillow covers. Jaipuri block-print designs, 180+ GSM, wholesale + retail prices direct from Jaipur.",
  heading: "Pure Cotton Bedsheets",
  subheading: "Soft, breathable, hand-picked cotton bedsheets in King, Queen, Double and Single sizes — direct from Jaipur looms.",
};

const bedsheetsQuery = queryOptions({
  queryKey: ["products", "cat", SLUG],
  queryFn: () => listProducts({ data: { categorySlug: SLUG } }),
});

export const Route = createFileRoute("/bedsheets")({
  head: (ctx) => {
    const products = ((ctx as { loaderData?: { slug: string; title: string }[] }).loaderData) ?? [];
    const url = `https://meenucollection.in/${SLUG}`;
    return {
      meta: [
        { title: META.title },
        { name: "description", content: META.description },
        { property: "og:title", content: META.title },
        { property: "og:description", content: META.description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
              { "@type": "ListItem", position: 2, name: META.heading, item: url },
            ],
          }),
        },
        ...(products.length > 0 ? [{
          type: "application/ld+json" as const,
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: META.heading,
            itemListElement: products.slice(0, 20).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://meenucollection.in/products/${p.slug}`,
              name: p.title,
            })),
          }),
        }] : []),
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(bedsheetsQuery),
  component: BedsheetsPage,
  pendingComponent: () => <ListingPageSkeleton count={8} />,
  errorComponent: ({ error, reset }) => <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function BedsheetsPage() {
  const { data: products } = useSuspenseQuery(bedsheetsQuery);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-bold text-brand-secondary sm:text-5xl">{META.heading}</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">{META.subheading}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
          {products.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              No products yet. <Link to="/products" className="text-brand-primary underline">See all products</Link>.
            </p>
          )}
        </div>
        <RelatedCategories exclude="/bedsheets" />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
