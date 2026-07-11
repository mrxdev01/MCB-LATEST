import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Database, MessageCircle, FileText, BadgeCheck, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Privacy & Trust — MEENU COLLECTION" },
      { name: "description", content: "How MEENU COLLECTION protects your data and orders." },
      { property: "og:title", content: "Privacy & Trust — MEENU COLLECTION" },
      { property: "og:description", content: "Our commitment to data privacy and honest business practices." },
    ],
    links: [{ rel: "canonical", href: canonical("/trust") }],
  }),
  component: Trust,
});

const PILLARS = [
  {
    icon: Lock,
    t: "No Card Data Stored",
    s: "Every order is placed directly on WhatsApp or phone. We never see, store, or process card details on this website.",
  },
  {
    icon: Database,
    t: "Secure Data Storage",
    s: "Product catalog and admin sessions run on a private backend with row-level security enabled on every table.",
  },
  {
    icon: MessageCircle,
    t: "Respectful Communication",
    s: "We contact you only about your enquiry or order — never promotional spam, never third-party sharing.",
  },
  {
    icon: BadgeCheck,
    t: "GST Verified Entity",
    s: "Registered wholesaler trusted by retailers across India — IndiaMART TrustSEAL certified.",
  },
];

function Trust() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero
          eyebrow="Privacy & Trust"
          title="Your trust,"
          accent="woven in."
          description="We're a small team from Jaipur — the same care that goes into our cotton goes into protecting your data."
          icon={ShieldCheck}
        />

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div
                key={p.t}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10 transition-all hover:-translate-y-1 hover:shadow-lift hover:ring-brand-primary/30"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-rose-400 text-white shadow-lift">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black text-brand-secondary">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-secondary/70">{p.s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Policy content */}
        <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6">
          <div className="rounded-3xl bg-white p-8 shadow-soft ring-1 ring-brand-primary/10 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-black text-brand-secondary sm:text-3xl">Privacy Policy</h2>
            </div>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-brand-secondary/75">
              <div>
                <h3 className="text-base font-black text-brand-secondary">Information we collect</h3>
                <p className="mt-1">
                  When you contact us via WhatsApp, phone, or email, we receive your name, contact number, and the message you send.
                  When you add products to the cart on this site, that cart lives in your browser's local storage — we don't see it until you send an enquiry.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-brand-secondary">How we use it</h3>
                <p className="mt-1">
                  Strictly to fulfil your enquiry or order — quote pricing, confirm shipping, share tracking, and answer product questions.
                  Never for marketing, never sold, never shared with third parties.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-brand-secondary">Payments</h3>
                <p className="mt-1">
                  Payments are collected offline (bank transfer, UPI, or COD where applicable). We do not store card numbers, CVVs, or bank credentials on this site.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-brand-secondary">Data retention</h3>
                <p className="mt-1">
                  Order-related WhatsApp / email threads are retained for warranty and support. You can ask us to delete your data any time by writing to <a href={`mailto:${BRAND.email}`} className="font-bold text-brand-primary underline-offset-2 hover:underline">{BRAND.email}</a>.
                </p>
              </div>
            </div>

            {/* Business info */}
            <div className="mt-8 grid gap-3 rounded-2xl bg-brand-soft/60 p-5 ring-1 ring-brand-primary/15 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-primary">GSTIN</p>
                <p className="mt-1 font-mono text-sm font-black text-brand-secondary">{BRAND.gst}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-primary">Email</p>
                <p className="mt-1 truncate text-sm font-black text-brand-secondary">{BRAND.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-primary">WhatsApp</p>
                <p className="mt-1 text-sm font-black text-brand-secondary">{BRAND.whatsappDisplay}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-lift hover:-translate-y-0.5 transition-transform"
              >
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary ring-1 ring-brand-primary/20 hover:ring-brand-primary/40 transition-all"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
