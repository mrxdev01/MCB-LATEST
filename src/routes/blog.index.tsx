import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { listBlogPosts } from "@/lib/blog.functions";
import { ListingPageSkeleton } from "@/components/skeletons";

const TITLE = "Blog — Cotton Fabric Care, Bedsheet Buying Guides | MEENU COLLECTION";
const DESC = "Cotton bedsheet care, GSM samjhaayi, Jaipuri print history, wholesale tips — Jaipur ke pure cotton experts se latest guides.";

const qo = queryOptions({ queryKey: ["blog", "list"], queryFn: () => listBlogPosts() });

export const Route = createFileRoute("/blog/")({
  head: () => {
    const url = "https://meenucollection.in/blog";
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "MEENU COLLECTION Blog",
          url,
        }),
      }],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: BlogIndex,
  pendingComponent: () => <ListingPageSkeleton count={6} />,
  errorComponent: ({ error, reset }) => <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(qo);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold text-brand-secondary sm:text-5xl">The MEENU COLLECTION Blog</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Cotton fabric care, buying guides, aur Jaipur crafts se latest stories.
        </p>
        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">Abhi tak koi post published nahi. Jald hi aa raha hai.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="card-hover card-hover-hover group block overflow-hidden rounded-3xl bg-card shadow-soft"
              >
                {p.cover_image && (
                  <div className="aspect-[16/10] overflow-hidden bg-brand-soft/30">
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  {p.published_at && (
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary/70">
                      {new Date(p.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  <h2 className="mt-2 text-lg font-bold text-brand-secondary group-hover:text-brand-primary">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
