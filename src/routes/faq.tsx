import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { FAQS } from "@/lib/faq-data";

const TITLE = "FAQ — Cotton Bedsheets, Nighty & Shirts Buying Guide | MEENU COLLECTION";
const DESC = "Cotton bedsheet care, GSM guide, size chart, wholesale MOQ, delivery, Jaipuri print pehchan aur bahut kuch — sare sawaal ke jawab.";

export const Route = createFileRoute("/faq")({
  head: () => {
    const url = "https://meenucollection.in/faq";
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://meenucollection.in/" },
              { "@type": "ListItem", position: 2, name: "FAQ", item: url },
            ],
          }),
        },
      ],
    };
  },
  component: FAQPage,
});

function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold text-brand-secondary sm:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Cotton bedsheets, nighty aur shirts ke bare me har sawaal — GSM, size chart, wash care, wholesale MOQ aur delivery.
        </p>
        <div className="mt-8 divide-y divide-brand-soft/60 overflow-hidden rounded-2xl border border-brand-soft/60 bg-white shadow-soft">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-soft/30"
                >
                  <span className="text-sm font-semibold text-brand-secondary sm:text-base">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-brand-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-brand-secondary/80">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
