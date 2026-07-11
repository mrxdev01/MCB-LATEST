import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getBlogPostBySlug } from "@/lib/blog.functions";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["blog", "slug", slug], queryFn: () => getBlogPostBySlug({ data: { slug } }) });

export const Route = createFileRoute("/blog/$slug")({
  head: (ctx) => {
    const p = (ctx as { loaderData?: { post?: { title?: string; slug?: string; excerpt?: string | null; seo_title?: string | null; seo_description?: string | null; cover_image?: string | null; published_at?: string | null; updated_at?: string | null; author?: string | null; content?: string } } }).loaderData?.post;
    const title = p?.seo_title || (p?.title ? `${p.title} | MEENU COLLECTION Blog` : "Blog — MEENU COLLECTION");
    const desc = p?.seo_description || p?.excerpt || "MEENU COLLECTION blog post.";
    const url = p?.slug ? `https://meenucollection.in/blog/${p.slug}` : "https://meenucollection.in/blog";
    const img = p?.cover_image ?? undefined;
    const scripts = p ? [{
      type: "application/ld+json" as const,
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: p.title,
        description: desc,
        image: img ? [img] : undefined,
        datePublished: p.published_at,
        dateModified: p.updated_at ?? p.published_at,
        author: { "@type": p.author ? "Person" : "Organization", name: p.author || "MEENU COLLECTION" },
        publisher: {
          "@type": "Organization",
          name: "MEENU COLLECTION",
          logo: { "@type": "ImageObject", url: "https://meenucollection.in/logo.png" },
        },
        mainEntityOfPage: url,
      }),
    }, {
      type: "application/ld+json" as const,
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://meenucollection.in/blog" },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      }),
    }] : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(img ? [{ property: "og:image" as const, content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!post) throw notFound();
    return { post };
  },
  component: BlogPostPage,
  errorComponent: ({ error, reset }) => <div className="p-8 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>Post not found.</p>
      <Link to="/blog" className="text-brand-primary underline">Back to blog</Link>
    </div>
  ),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(qo(slug));
  if (!post) return null;
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/blog" className="hover:text-brand-primary">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-secondary line-clamp-1">{post.title}</span>
        </nav>
        {post.cover_image && (
          <img loading="lazy" decoding="async" src={post.cover_image} alt={post.title} className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover shadow-soft" />
        )}
        <h1 className="text-3xl font-bold text-brand-secondary sm:text-4xl">{post.title}</h1>
        {post.published_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })} · {post.author ?? "MEENU COLLECTION"}
          </p>
        )}
        {post.excerpt && <p className="mt-4 text-lg text-brand-secondary/80">{post.excerpt}</p>}
        <article className="blog-content prose prose-lg prose-neutral mt-8 max-w-none prose-headings:text-brand-secondary prose-headings:font-black prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-3xl prose-h2:border-b prose-h2:border-brand-soft prose-h2:pb-2 prose-h3:mt-8 prose-h3:text-xl prose-p:text-brand-secondary/85 prose-p:leading-[1.85] prose-a:text-brand-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-brand-secondary prose-strong:font-bold prose-li:my-1 prose-ul:my-4 prose-ol:my-4 prose-blockquote:border-l-4 prose-blockquote:border-brand-primary prose-blockquote:bg-brand-soft/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-brand-soft/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-brand-secondary prose-code:before:content-none prose-code:after:content-none prose-img:rounded-2xl prose-img:shadow-soft prose-hr:border-brand-soft">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </article>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-brand-soft/60 px-3 py-1 text-xs font-medium text-brand-secondary">#{t}</span>
            ))}
          </div>
        )}

        {/* Shop CTA — internal linking to products */}
        <aside className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-soft/60 via-white to-amber-50 p-6 shadow-soft ring-1 ring-brand-primary/15 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-primary">Shop the Story</p>
          <h3 className="mt-2 text-xl font-black text-brand-secondary sm:text-2xl">
            Loved this read? Explore our pure cotton range.
          </h3>
          <p className="mt-2 text-sm text-brand-secondary/70">
            Handpicked bedsheets, nighties and shirts — direct from Jaipur looms.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/bedsheets" className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-soft hover:opacity-90">
              Cotton Bedsheets <ChevronRight className="h-3 w-3" />
            </Link>
            <Link to="/nighty" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-secondary shadow-soft ring-1 ring-brand-primary/20 hover:ring-brand-primary/40">
              Cotton Nighty <ChevronRight className="h-3 w-3" />
            </Link>
            <Link to="/men-shirts" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-secondary shadow-soft ring-1 ring-brand-primary/20 hover:ring-brand-primary/40">
              Men's Shirts <ChevronRight className="h-3 w-3" />
            </Link>
            <Link to="/products" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-secondary shadow-soft ring-1 ring-brand-primary/20 hover:ring-brand-primary/40">
              All Products <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
