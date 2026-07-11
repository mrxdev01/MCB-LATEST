import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MEENU COLLECTION" },
      { name: "description", content: "Terms of use for the MEENU COLLECTION website and orders placed via WhatsApp or phone." },
      { property: "og:title", content: "Terms & Conditions — MEENU COLLECTION" },
      { property: "og:description", content: "Rules of use, pricing, order confirmation, and liability for MEENU COLLECTION." },
    ],
    links: [{ rel: "canonical", href: canonical("/terms") }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero eyebrow="Legal" title="Terms &" accent="Conditions" description="The rules that apply when you browse this website or place an order with us." icon={FileText} />

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="space-y-6 rounded-3xl border border-brand-primary/10 bg-white p-6 shadow-soft sm:p-8 text-[15px] leading-relaxed text-brand-secondary/85">
            <div>
              <h2 className="text-lg font-black text-brand-secondary">1. About Us</h2>
              <p className="mt-2">This website is operated by {BRAND.name}, based at {BRAND.address}. GST: {BRAND.gst}.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">2. Product Information</h2>
              <p className="mt-2">We try to display each product's colour, size and design as accurately as possible. Because cotton is a natural fabric and screens vary, slight colour or size variations are normal and are not considered defects.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">3. Orders & Pricing</h2>
              <p className="mt-2">Orders are placed directly on WhatsApp or phone. Prices displayed on the website may be updated at any time without prior notice. The final confirmed price is the one shared on WhatsApp before dispatch.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">4. Payments</h2>
              <p className="mt-2">We accept UPI, bank transfer and cash on selected orders. This website does not store or process any card / banking details.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">5. Shipping, Returns & Refunds</h2>
              <p className="mt-2">Shipping is governed by our <a className="text-brand-primary underline" href="/shipping-policy">Shipping Policy</a>. Returns and refunds are governed by our <a className="text-brand-primary underline" href="/return-refund">Return & Refund Policy</a>.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">6. Intellectual Property</h2>
              <p className="mt-2">All images, product photography, logo and content on this website are the property of {BRAND.name} and may not be copied or reused without written permission.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">7. Liability</h2>
              <p className="mt-2">Our liability for any order is limited to the value of that order. We are not responsible for indirect losses, courier delays outside our control, or misuse of the product after delivery.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">8. Governing Law</h2>
              <p className="mt-2">Any disputes are subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan, India.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">9. Contact</h2>
              <p className="mt-2">Email: <a className="text-brand-primary underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> · WhatsApp: <a className="text-brand-primary underline" href={`https://wa.me/${BRAND.whatsapp}`}>{BRAND.whatsappDisplay}</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
