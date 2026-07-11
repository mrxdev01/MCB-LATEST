import { createFileRoute } from "@tanstack/react-router";
import { Truck, Package, MapPin, Clock, IndianRupee } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — MEENU COLLECTION" },
      { name: "description", content: "Dispatch time, delivery estimates, shipping partners and charges for MEENU COLLECTION orders across India." },
      { property: "og:title", content: "Shipping Policy — MEENU COLLECTION" },
      { property: "og:description", content: "Pan-India shipping from Jaipur — dispatch, delivery times, tracking and charges." },
    ],
    links: [{ rel: "canonical", href: canonical("/shipping-policy") }],
  }),
  component: Shipping,
});

const CARDS = [
  { icon: Package, t: "Dispatch Time", s: "Orders are quality-checked, video-packed and dispatched within 1–3 business days from our Jaipur shop." },
  { icon: Truck, t: "Delivery Time", s: "Standard delivery across India is 3–7 business days after dispatch, depending on the pincode and courier partner." },
  { icon: MapPin, t: "Pan-India Coverage", s: "We ship to almost every serviceable pincode in India through trusted courier partners." },
  { icon: IndianRupee, t: "Shipping Charges", s: "Shipping charges (if any) are shown on WhatsApp before you confirm the order. Bulk / wholesale orders often qualify for free shipping." },
  { icon: Clock, t: "Tracking", s: "Once dispatched, tracking id is shared on WhatsApp so you can track the parcel in real time." },
];

function Shipping() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero
          eyebrow="Policy"
          title="Shipping"
          accent="Policy"
          description={`Pan-India shipping direct from ${BRAND.city}. Every parcel is video-packed for your safety.`}
          icon={Truck}
        />

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {CARDS.map(({ icon: Icon, t, s }) => (
              <div key={t} className="rounded-3xl border border-brand-primary/10 bg-white p-6 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-black text-brand-secondary">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-secondary/75">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-brand-soft to-white p-6 ring-1 ring-brand-primary/15 sm:p-8">
            <h2 className="text-xl font-black text-brand-secondary sm:text-2xl">Important Notes</h2>
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-brand-secondary/80">
              <li>• Delivery times are estimates and may vary due to weather, festivals or courier delays.</li>
              <li>• Please share a correct address and reachable mobile number to avoid RTO.</li>
              <li>• For remote / non-serviceable pincodes we may suggest an alternate address.</li>
              <li>• On delivery, if the outer parcel looks tampered, refuse it and inform us immediately.</li>
            </ul>
            <p className="mt-4 text-sm text-brand-secondary/70">
              For any shipping query WhatsApp us at{" "}
              <a className="font-semibold text-brand-primary" href={`https://wa.me/${BRAND.whatsapp}`}>{BRAND.whatsappDisplay}</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
