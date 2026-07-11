import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Package, IndianRupee, Truck, ShieldCheck, Heart, Sparkles, ArrowRight, MessageCircle, Scissors, Search, PackageCheck, Send, BadgeCheck, Star, Award, Lock } from "lucide-react";
import trustSeal from "@/assets/indiamart-trustseal.png.asset.json";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { genericEnquiryUrl } from "@/lib/whatsapp";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MEENU COLLECTION — Pure Cotton Wholesaler in Jaipur since 2022" },
      { name: "description", content: "MEENU COLLECTION — Jaipur based premium pure cotton wholesaler & retailer. Bedsheets, printed men shirts, women nighty. GST registered, IndiaMART TrustSEAL verified, pan-India shipping." },
      { property: "og:title", content: "About MEENU COLLECTION — Jaipur Pure Cotton Wholesaler" },
      { property: "og:description", content: "Premium cotton wholesaler & retailer from Jaipur — GST verified, IndiaMART TrustSEAL supplier." },
      { property: "og:url", content: canonical("/about") },
    ],
    links: [
      { rel: "canonical", href: canonical("/about") },
      { rel: "preload", as: "image", href: trustSeal.url },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About MEENU COLLECTION",
          url: canonical("/about"),
          mainEntity: { "@id": "https://meenucollection.in/#store" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
            { "@type": "ListItem", position: 2, name: "About", item: canonical("/about") },
          ],
        }),
      },
    ],
  }),
  component: About,
});

const VALUES = [
  { icon: Leaf, t: "Pure Cotton", s: "Hand-picked yarn, 100% breathable — kind to skin, kinder to the planet." },
  { icon: Package, t: "Block Printed", s: "Traditional Jaipuri motifs, printed with natural dyes by Rajasthani artisans." },
  { icon: IndianRupee, t: "Honest Wholesale", s: "Direct from the loom to your door — no middlemen, no markup games." },
  { icon: Truck, t: "Pan-India Shipping", s: "Fast, tracked delivery from Jaipur to every corner of India." },
  { icon: ShieldCheck, t: "GST Verified", s: "Registered wholesaler trusted by retailers across India." },
  { icon: Heart, t: "Made with Love", s: "Every piece is picked, folded and packed by a small team that cares." },
];

const PROCESS = [
  { icon: Search, step: "01", t: "Sourced in Rajasthan", d: "Pure cotton yarn and fabric hand-picked directly from trusted Jaipur mills — no middlemen, no compromise." },
  { icon: Scissors, step: "02", t: "Crafted by Artisans", d: "Traditional block prints and stitching by local Rajasthani artisans who've mastered the craft for generations." },
  { icon: PackageCheck, step: "03", t: "Checked Piece by Piece", d: "Every bedsheet, shirt and nighty is inspected for print, stitch and finish before it reaches you." },
  { icon: Send, step: "04", t: "Shipped Pan-India", d: "Carefully folded, safely packed and dispatched from Jaipur — tracked delivery to every pincode." },
];

function TrustSealFallback() {
  return (
    <div className="aspect-[628/817] w-full rounded-2xl bg-white px-6 py-8 text-center text-brand-secondary shadow-inner ring-1 ring-brand-primary/10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-accent text-brand-primary shadow-soft">
        <ShieldCheck className="h-9 w-9" />
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-secondary/55">Certificate of Trust</p>
      <h3 className="mt-5 text-3xl font-black text-brand-secondary">Meenu Collection</h3>
      <p className="mt-2 text-sm font-semibold text-brand-secondary/65">Rajasthan, India</p>
      <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-3 text-left">
        {[
          "GST Registration",
          "Bank Account",
          "Business Address",
          "IndiaMART TrustSeal",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-xl bg-brand-soft/55 p-3 text-xs font-bold text-brand-secondary/75">
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand-primary" /> {item}
          </div>
        ))}
      </div>
      <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground">
        <Award className="h-3.5 w-3.5" /> Certificate ID: 241386
      </div>
      <p className="mx-auto mt-6 max-w-xs text-xs leading-relaxed text-brand-secondary/55">
        Official IndiaMART TrustSeal supplier details are available for verification.
      </p>
    </div>
  );
}

function TrustSealCertificate() {
  const [imageFailed, setImageFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) {
      setImageFailed(true);
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/40 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 transition-transform duration-1000 group-hover:translate-x-full" />
      {imageFailed ? (
        <TrustSealFallback />
      ) : (
        <img
          ref={imageRef}
          src={trustSeal.url}
          alt="IndiaMART TrustSeal Certificate awarded to Meenu Collection Jaipur — Certificate ID 241386"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={628}
          height={817}
          onError={() => setImageFailed(true)}
          className="aspect-[628/817] h-auto w-full rounded-2xl bg-white object-contain"
        />
      )}
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero
          eyebrow="Our Story"
          title="Woven in"
          accent="Jaipur."
          description={`${BRAND.name} has been crafting premium pure cotton textiles for families and retailers across India — one honest thread at a time.`}
        />

        {/* Story block */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Who we are</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
                A small studio, a big obsession with <span className="text-brand-primary">pure cotton</span>.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-brand-secondary/75">
                Based in the Pink City, we work directly with mills and artisans across Rajasthan.
                From King-size floral bedsheets to breathable printed shirts and everyday nighties —
                every piece is chosen with care, priced honestly, and shipped fast.
              </p>
              <p className="mt-4 text-base leading-relaxed text-brand-secondary/75">
                Even a <span className="font-bold text-brand-secondary">single piece</span> is welcome at
                wholesale rate. Order through WhatsApp for personalised recommendations, size guidance,
                and bulk quotes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={genericEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-lift hover:-translate-y-0.5 transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Say Hello
                </a>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary ring-1 ring-brand-primary/20 shadow-soft hover:ring-brand-primary/40 transition-all"
                >
                  Shop Collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* stats card */}
            <div className="relative">
              <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand-secondary shadow-lift">
                <Sparkles className="h-3 w-3" /> Since 2022
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-white via-white to-rose-50 p-6 shadow-lift ring-1 ring-brand-primary/10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { n: "4+", l: "Years in Jaipur" },
                    { n: "500+", l: "Retailers Served" },
                    { n: "1K+", l: "Happy Homes" },
                    { n: "100%", l: "Pure Cotton" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-brand-soft/50 p-4 text-center ring-1 ring-brand-primary/10">
                      <p className="text-3xl font-black text-brand-primary sm:text-4xl">{s.n}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-secondary/70">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-brand-secondary p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">GSTIN</p>
                  <p className="mt-1 font-mono text-sm font-black tracking-wider text-white">{BRAND.gst}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values grid */}
        <section className="bg-white/60 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">What we stand for</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
                Six things we <span className="text-brand-primary">never compromise</span> on.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v) => (
                <div
                  key={v.t}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10 transition-all hover:-translate-y-1 hover:shadow-lift hover:ring-brand-primary/30"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-primary/15 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-rose-400 text-white shadow-lift">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-brand-secondary">{v.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-secondary/65">{v.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IndiaMART TrustSeal — Verified Supplier Showcase */}
        <section className="relative isolate overflow-hidden py-20">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_45%,#3b0764_100%)]" />
          {/* animated aurora blobs */}
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 -z-10 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-indigo-500/25 blur-3xl animate-pulse [animation-delay:1.2s]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_60%)]" />

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white ring-1 ring-white/20 backdrop-blur">
                <Lock className="h-3 w-3" /> Verified & Trusted
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Official <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">IndiaMART TrustSeal</span> Supplier
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Independently verified by India's largest B2B marketplace — GST, Bank & Business Address all authenticated. Shop with complete confidence.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              {/* Certificate — animated */}
              <div className="group relative mx-auto w-full max-w-md">
                {/* rotating glow ring */}
                <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[conic-gradient(from_0deg,#f59e0b,#ec4899,#8b5cf6,#3b82f6,#f59e0b)] opacity-70 blur-xl animate-[spin_8s_linear_infinite]" />
                {/* floating badge */}
                <div className="absolute -top-4 -right-4 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-2xl ring-2 ring-white/30 animate-bounce [animation-duration:2.5s]">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </div>
                <TrustSealCertificate />
                {/* certificate id chip */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/15 backdrop-blur">
                  <Award className="h-3.5 w-3.5 text-amber-300" /> Certificate ID: 241386
                </div>
              </div>

              {/* Verifications + rating */}
              <div className="space-y-4">
                {/* rating card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 p-6 ring-1 ring-amber-300/30 backdrop-blur">
                  <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/30 blur-2xl" />
                  <div className="flex items-center gap-4">
                    <div className="flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className="h-6 w-6 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          style={{ animation: `fade-in 0.4s ease-out ${i * 0.12}s both` }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-4xl font-black leading-none text-white">4.9<span className="text-2xl text-white/60">/5</span></p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">IndiaMART Rating</p>
                    </div>
                  </div>
                </div>

                {/* verified items */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, t: "GST Registered", s: "Govt. Verified" },
                    { icon: BadgeCheck, t: "Bank Account", s: "Bank Verified" },
                    { icon: Award, t: "Business Address", s: "On-site Verified" },
                  ].map((v, i) => (
                    <div
                      key={v.t}
                      className="group/card relative overflow-hidden rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/15 hover:ring-emerald-300/40"
                      style={{ animation: `fade-in 0.5s ease-out ${0.2 + i * 0.1}s both` }}
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                        <v.icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-black text-white">{v.t}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/80">{v.s}</p>
                    </div>
                  ))}
                </div>

                {/* validity strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Issued</p>
                    <p className="mt-0.5 text-sm font-black text-white">September 2025</p>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Valid Till</p>
                    <p className="mt-0.5 text-sm font-black text-white">September 2026</p>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Status</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Active
                    </p>
                  </div>
                </div>

                <p className="pt-2 text-center text-[11px] text-white/50 sm:text-left">
                  System-generated certificate — verifiable on Official IndiaMART Verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process — How We Work */}

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">How We Work</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-secondary sm:text-4xl">
              From the loom in Jaipur to your <span className="text-brand-primary">doorstep</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-brand-secondary/70 sm:text-base">
              Four honest steps — no shortcuts, no surprises. Just pure cotton, made the right way.
            </p>
          </div>

          <div className="relative mt-12">
            {/* connecting line for desktop */}
            <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent lg:block" />

            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((p) => (
                <li
                  key={p.step}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10 transition-all hover:-translate-y-1 hover:shadow-lift hover:ring-brand-primary/30"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-rose-400 text-white shadow-lift">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-3xl font-black tracking-tight text-brand-primary/15">
                      {p.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-black text-brand-secondary">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-secondary/65">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>


        {/* CTA band */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#1a0d12_0%,#2a1520_45%,#4a1d34_100%)]" />
          <div aria-hidden className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-40 hero-aurora" />
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to feel the difference?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Explore the collection or drop us a message — we reply within an hour.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary shadow-lift hover:-translate-y-0.5 transition-transform"
              >
                Browse Products <ArrowRight className="h-4 w-4 text-brand-primary" />
              </Link>
              <a
                href={genericEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-brand-accent" /> WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
