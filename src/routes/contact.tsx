import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle, Clock, Copy, Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { genericEnquiryUrl } from "@/lib/whatsapp";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — WhatsApp, Phone, Email | MEENU COLLECTION Jaipur" },
      { name: "description", content: "Contact MEENU COLLECTION Jaipur on WhatsApp +91 91163 74846, phone or email for wholesale & retail cotton bedsheets, shirts and nighty orders. GST invoice, pan-India shipping." },
      { property: "og:title", content: "Contact MEENU COLLECTION Jaipur" },
      { property: "og:description", content: "Reach us on WhatsApp, phone or email for cotton wholesale & retail orders." },
      { property: "og:url", content: canonical("/contact") },
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact MEENU COLLECTION",
          url: canonical("/contact"),
          mainEntity: {
            "@type": "Organization",
            "@id": "https://meenucollection.in/#store",
            name: BRAND.name,
            telephone: BRAND.phone,
            email: BRAND.email,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
            { "@type": "ListItem", position: 2, name: "Contact", item: canonical("/contact") },
          ],
        }),
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  };

  const channels = [
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      value: BRAND.whatsappDisplay,
      hint: "Fastest — reply within an hour",
      href: genericEnquiryUrl(),
      external: true,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      key: "phone",
      icon: Phone,
      label: "Call Us",
      value: BRAND.phone,
      hint: "Mon–Sat · 10am – 8pm IST",
      href: `tel:${BRAND.phone}`,
      accent: "from-brand-primary to-rose-400",
    },
    {
      key: "email",
      icon: Mail,
      label: "Email",
      value: BRAND.email,
      hint: "For invoices & bulk orders",
      href: `mailto:${BRAND.email}`,
      accent: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero
          eyebrow="Get in Touch"
          title="We'd love to"
          accent="hear from you."
          description="Wholesale, retail, or a custom bulk order — pick your favourite channel and we'll take it from there."
          icon={MessageCircle}
        />

        {/* Channels */}
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 -mt-8">
          <div className="grid gap-4 md:grid-cols-3">
            {channels.map((c) => {
              const CardTag: "a" = "a";
              return (
                <CardTag
                  key={c.key}
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-lift ring-1 ring-brand-primary/10 transition-all hover:-translate-y-1 hover:ring-brand-primary/30"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-white shadow-lift`}>
                      <c.icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-brand-secondary/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-primary" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">{c.label}</p>
                  <p className="mt-1 truncate text-lg font-black text-brand-secondary">{c.value}</p>
                  <p className="mt-1 text-xs text-brand-secondary/60">{c.hint}</p>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); copy(c.key, c.value); }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:bg-brand-soft"
                  >
                    {copied === c.key ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copied === c.key ? "Copied" : "Copy"}
                  </button>
                </CardTag>
              );
            })}
          </div>
        </section>

        {/* Address + hours */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* address card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-secondary via-[#2a1520] to-[#4a1d34] p-8 text-white shadow-lift sm:p-10">
              <div aria-hidden className="pointer-events-none absolute -top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-40 hero-aurora" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white ring-1 ring-white/25 backdrop-blur">
                  <MapPin className="h-3 w-3 text-brand-accent" /> Visit Us
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                  {BRAND.name}
                </h2>
                <p className="mt-3 max-w-md text-white/80">{BRAND.address}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={BRAND.indiamartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-secondary shadow-lift hover:-translate-y-0.5 transition-transform"
                  >
                    IndiaMART Catalog <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>

              </div>
            </div>

            {/* hours + GST */}
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Clock className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-black text-brand-secondary">Business Hours</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    { d: "Mon – Fri", t: "10:00 – 20:00" },
                    { d: "Saturday", t: "10:00 – 18:00" },
                    { d: "Sunday", t: "Closed" },
                  ].map((h) => (
                    <li key={h.d} className="flex items-center justify-between border-b border-dashed border-brand-primary/10 pb-2 last:border-0">
                      <span className="text-brand-secondary/70">{h.d}</span>
                      <span className="font-bold text-brand-secondary">{h.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-brand-soft/60 p-6 ring-1 ring-brand-primary/15">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">GSTIN</p>
                <p className="mt-2 font-mono text-lg font-black tracking-wider text-brand-secondary">{BRAND.gst}</p>
                <p className="mt-1 text-xs text-brand-secondary/60">Govt. of India registered · {BRAND.state}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
