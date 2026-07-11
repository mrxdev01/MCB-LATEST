import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  BadgeCheck,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  MapPin,
  IndianRupee,
  Leaf,
  Truck,
  Package,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { BestSellingSection, bestsellersQO } from "@/components/BestSellingSection";
import { HomeTestimonials } from "@/components/HomeTestimonials";
import { listTopCollections } from "@/lib/collections.functions";
import { listProducts } from "@/lib/products.functions";
import { BRAND } from "@/lib/brand";
import { ikUrl, ikSrcSet } from "@/lib/img";
import { genericEnquiryUrl } from "@/lib/whatsapp";
import { HomePageSkeleton } from "@/components/skeletons";
import { canonical } from "@/lib/seo";

const topCollectionsQO = queryOptions({
  queryKey: ["collections", "top"],
  queryFn: () => listTopCollections(),
});
const featuredQO = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: () => listProducts({ data: { featuredOnly: true, limit: 8 } }),
});

const HOME_TITLE = "Pure Cotton Bedsheets, Men Shirts & Nighty Online — Wholesale from Jaipur | MEENU COLLECTION";
const HOME_DESC = "Buy 100% pure cotton bedsheets (King/Queen/Single), printed men shirts and women nighty online in India. Direct from Jaipur wholesaler — GST verified, pan-India shipping, single-piece wholesale rate on WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESC },
      { property: "og:url", content: canonical("/") },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESC },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(topCollectionsQO),
      context.queryClient.ensureQueryData(featuredQO),
      context.queryClient.ensureQueryData(bestsellersQO),
    ]);
  },
  component: Home,
  pendingComponent: HomePageSkeleton,
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-center">
      <p className="text-brand-secondary">Something went wrong loading the homepage.</p>
      <button onClick={reset} className="mt-3 rounded-full bg-brand-primary px-4 py-2 text-white">
        Retry
      </button>
      <p className="mt-4 text-xs text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function Home() {
  const { data: topCols } = useSuspenseQuery(topCollectionsQO);
  const { data: featured } = useSuspenseQuery(featuredQO);
  const [copied, setCopied] = useState(false);

  const copyGst = async () => {
    try {
      await navigator.clipboard.writeText(BRAND.gst);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden hero-bg">
          {/* rotating aurora conic */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/3 left-1/2 -z-0 h-[900px] w-[900px] -translate-x-1/2 rounded-full opacity-60 hero-aurora"
          />
          {/* grid lines */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hero-grid-lines" />
          {/* diagonal shine sweep */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hero-shine" />
          {/* grain */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hero-noise" />

          {/* animated soft blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-primary/25 blur-3xl hero-blob"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl hero-blob-slow"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-rose-300/30 blur-3xl hero-blob"
          />

          {/* thin gradient border at bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent"
          />


          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            {/* LEFT */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-secondary shadow-soft ring-1 ring-brand-primary/20">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-primary text-white">
                  <ShieldCheck className="h-3 w-3" />
                </span>
                <span className="text-brand-primary">IndiaMART</span>
                <span className="text-brand-secondary">TrustSEAL</span>
                <span className="text-brand-secondary">Verified</span>
              </span>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">
                {BRAND.name} • {BRAND.city}
              </p>

              <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-brand-secondary sm:text-5xl md:text-6xl lg:text-[64px]">
                Premium
                <br />
                <span className="relative inline-block text-brand-primary">
                  Pure Cotton
                  <svg
                    aria-hidden
                    viewBox="0 0 300 12"
                    className="absolute -bottom-1 left-0 h-2 w-full text-brand-primary/70"
                    preserveAspectRatio="none"
                  >
                    <path d="M2 8 Q 80 2 160 6 T 298 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                at Honest
                <br />
                Wholesale Prices
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-brand-secondary/70">
                Direct from {BRAND.city} — pure cotton bedsheets, printed cotton shirts for men, and
                comfortable nighties. Even a <span className="font-bold text-brand-secondary">single piece</span> welcome
                at wholesale rate.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/bedsheets"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Shop Collection
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <a
                  href={genericEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-secondary shadow-soft ring-1 ring-brand-primary/20 backdrop-blur transition-all hover:-translate-y-0.5 hover:ring-brand-primary/40"
                >
                  <MessageCircle className="h-4 w-4 text-brand-primary" />
                  Wholesale Enquiry
                </a>
              </div>

              {/* stats */}
              <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  { n: "4+", l: "Years in Jaipur" },
                  { n: "500+", l: "Retailers Served" },
                  { n: "100%", l: "Pure Cotton" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-3xl font-black text-brand-secondary">{s.n}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-secondary/60">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — verification card */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* est jaipur chip */}
              <div className="absolute -top-3 left-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-secondary shadow-lift ring-1 ring-brand-primary/15">
                <Sparkles className="h-3 w-3 text-brand-primary" />
                Est. {BRAND.city}
              </div>

              {/* bulk & retail chip */}
              <div className="absolute -bottom-3 right-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900 shadow-lift ring-1 ring-amber-300/60">
                <Package className="h-3 w-3" />
                Bulk & Retail
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-white via-white to-rose-50/70 p-5 shadow-lift ring-1 ring-brand-primary/10 backdrop-blur-sm sm:p-6">
                {/* header */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                      <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                        Verified Business
                      </p>
                      <p className="truncate text-sm font-black text-brand-secondary">{BRAND.name}</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>

                {/* GST card */}
                <div className="mt-5 rounded-2xl bg-rose-50/70 p-4 ring-1 ring-brand-primary/10">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                      <ShieldCheck className="h-3 w-3" /> GSTIN Verified
                    </p>
                    <button
                      onClick={copyGst}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-secondary shadow-soft ring-1 ring-brand-primary/10 hover:text-brand-primary"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 font-mono text-base font-black tracking-wider text-brand-secondary">
                    {BRAND.gst}
                  </p>
                  <p className="mt-1 text-[11px] text-brand-secondary/60">
                    Govt. of India registered • {BRAND.state}
                  </p>
                </div>

                {/* two mini cards */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href={BRAND.trustsealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/70 transition-all hover:-translate-y-0.5 hover:ring-amber-300"
                  >
                    <ExternalLink className="absolute right-3 top-3 h-3.5 w-3.5 text-amber-700/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">TrustSEAL</p>
                    <p className="mt-1 text-xs font-bold leading-tight text-brand-secondary">
                      IndiaMART
                      <br />
                      Certified Supplier
                    </p>
                  </a>

                  <a
                    href={BRAND.indiamartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl bg-brand-primary/10 p-4 ring-1 ring-brand-primary/20 transition-all hover:-translate-y-0.5 hover:ring-brand-primary/40"
                  >
                    <ExternalLink className="absolute right-3 top-3 h-3.5 w-3.5 text-brand-primary/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand-primary/15 text-brand-primary">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-primary">Catalog</p>
                    <p className="mt-1 text-xs font-bold leading-tight text-brand-secondary">
                      View Full Range
                      <br />
                      on IndiaMART
                    </p>
                  </a>
                </div>

                <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-brand-secondary/50">
                  ✦ Trusted by Retailers across India ✦
                </p>
              </div>
            </div>
          </div>

          {/* trust strip */}
          <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { icon: ShieldCheck, t: "IndiaMART", s: "TrustSEAL" },
                { icon: BadgeCheck, t: "GST", s: "Verified Entity" },
                { icon: IndianRupee, t: "Wholesale", s: "Honest Pricing" },
                { icon: Leaf, t: "100% Cotton", s: "Pure & Soft" },
                { icon: Truck, t: "Pan-India", s: "Fast Shipping" },
              ].map((b) => (
                <div
                  key={b.t}
                  className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2.5 shadow-soft ring-1 ring-brand-primary/10 backdrop-blur"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-black text-brand-secondary">{b.t}</p>
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-brand-secondary/50">
                      {b.s}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop by Category */}
        <section className="relative overflow-hidden py-16 sm:py-20 content-auto">
          {/* soft backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-10%,rgba(213,82,122,0.10),transparent_60%),radial-gradient(700px_400px_at_100%_100%,rgba(212,178,106,0.14),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] hero-grid-lines"
          />

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Heading */}
            <div className="mb-10 flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary shadow-soft ring-1 ring-brand-primary/15 backdrop-blur">
                <Sparkles className="h-3 w-3" /> Collections
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-brand-secondary sm:text-5xl">
                Shop by{" "}
                <span className="relative inline-block text-brand-primary">
                  Category
                  <svg
                    aria-hidden
                    viewBox="0 0 220 10"
                    className="absolute -bottom-1 left-0 h-2 w-full text-brand-primary/70"
                    preserveAspectRatio="none"
                  >
                    <path d="M2 6 Q 60 1 120 5 T 218 3" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm text-brand-secondary/70 sm:text-base">
                Handpicked pure cotton essentials — direct from {BRAND.city} looms to your doorstep.
              </p>
            </div>

            {/* Uniform square grid — no cropping of collection artwork */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {topCols.map((c, i) => (
                <Link
                  key={c.id}
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group relative isolate block overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-brand-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-primary/30"
                >
                  {/* Square image area — object-contain preserves full artwork */}
                  <div className="relative aspect-square w-full overflow-hidden bg-brand-soft/40">
                    {c.image_url ? (
                      <img
                        src={ikUrl(c.image_url, 500)}
                        srcSet={ikSrcSet(c.image_url, [200, 400, 600, 800])}
                        sizes="(min-width: 1024px) 22vw, (min-width: 768px) 33vw, 50vw"
                        alt={c.name}
                        loading={i < 2 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : undefined}
                        decoding="async"
                        width={500}
                        height={500}
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-brand-primary/60 text-sm font-semibold">
                        {c.name}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[10px] font-black text-brand-primary shadow-soft ring-1 ring-brand-primary/20">
                      0{i + 1}
                    </span>
                  </div>
                  {/* Text below image so cards are consistent height */}
                  <div className="flex items-center justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand-primary/70">
                        Collection
                      </p>
                      <h3 className="mt-0.5 truncate text-base font-black text-brand-secondary sm:text-lg">
                        {c.name}
                      </h3>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-brand-primary transition-all group-hover:bg-brand-primary group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
              {topCols.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                  No collections yet. Add some in the admin panel.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Best Selling — powered by is_bestseller flag from admin */}
        <BestSellingSection />




        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 content-auto">
            <h2 className="mb-8 text-3xl font-bold text-brand-secondary sm:text-4xl">Featured Products</h2>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* About snippet — Made in Jaipur */}
        <section className="relative isolate overflow-hidden py-20 sm:py-28 content-auto">
          {/* deep gradient bg */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#1a0d12_0%,#2a1520_45%,#4a1d34_100%)]"
          />
          {/* aurora glow (softer, behind cards) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-40 hero-aurora"
          />
          {/* grid lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.10]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)",
            }}
          />
          {/* corner blobs */}
          <div aria-hidden className="pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-brand-primary/30 blur-3xl hero-blob" />
          <div aria-hidden className="pointer-events-none absolute -right-16 bottom-8 -z-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl hero-blob-slow" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
            {/* LEFT — big statement */}
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white ring-1 ring-white/30 backdrop-blur">
                <MapPin className="h-3 w-3 text-brand-accent" />
                Pink City · Rajasthan
              </span>

              <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Made in{" "}
                <span className="relative inline-block bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent">
                  Jaipur
                  <svg
                    aria-hidden
                    viewBox="0 0 200 10"
                    className="absolute -bottom-1 left-0 h-2 w-full text-brand-accent"
                    preserveAspectRatio="none"
                  >
                    <path d="M2 6 Q 60 1 120 5 T 198 3" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                Loved Across{" "}
                <span className="text-brand-accent">India.</span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85">
                {BRAND.name} has been supplying premium cotton textiles to homes and retailers
                across India. Every piece is woven with care, block-printed with tradition,
                and priced to stay within reach.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary shadow-lift transition-all hover:-translate-y-0.5"
                >
                  Our Story
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-primary text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <a
                  href={genericEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur transition-all hover:bg-white/25"
                >
                  <MessageCircle className="h-4 w-4 text-brand-accent" />
                  Talk to Us
                </a>
              </div>
            </div>

            {/* RIGHT — feature cards */}
            <div className="relative pt-6">
              {/* corner label */}
              <div className="absolute -top-1 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand-secondary shadow-lift">
                <Sparkles className="h-3 w-3" /> Since {BRAND.city}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: Leaf, t: "Pure Cotton", s: "100% breathable, hand-picked yarn" },
                  { icon: Package, t: "Block Printed", s: "Traditional Jaipuri motifs" },
                  { icon: IndianRupee, t: "Mill Prices", s: "Direct from the loom" },
                  { icon: Truck, t: "Pan-India", s: "Fast, tracked shipping" },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="group relative overflow-hidden rounded-3xl bg-white/[0.14] p-5 ring-1 ring-white/25 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/[0.18] hover:ring-white/40"
                  >
                    {/* subtle gradient overlay */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-primary/40 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-rose-400 text-white shadow-lift">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-base font-black text-white">{f.t}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">{f.s}</p>
                  </div>
                ))}
              </div>

              {/* stat strip */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/[0.14] p-4 ring-1 ring-white/25 backdrop-blur-md sm:mt-6">
                {[
                  { n: "4+", l: "Years" },
                  { n: "500+", l: "Retailers" },
                  { n: "1K+", l: "Happy Homes" },
                ].map((s) => (
                  <div key={s.l} className="px-2 text-center">
                    <p className="bg-gradient-to-b from-white to-brand-accent bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                      {s.n}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <HomeTestimonials />

      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
