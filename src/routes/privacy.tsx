import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MEENU COLLECTION" },
      { name: "description", content: "How MEENU COLLECTION collects, uses and protects the information you share with us." },
      { property: "og:title", content: "Privacy Policy — MEENU COLLECTION" },
      { property: "og:description", content: "What we collect, why, and how we protect your information." },
    ],
    links: [{ rel: "canonical", href: canonical("/privacy") }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero eyebrow="Legal" title="Privacy" accent="Policy" description="What information we collect and how we use it." icon={Lock} />

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="space-y-6 rounded-3xl border border-brand-primary/10 bg-white p-6 shadow-soft sm:p-8 text-[15px] leading-relaxed text-brand-secondary/85">
            <div>
              <h2 className="text-lg font-black text-brand-secondary">1. Information We Collect</h2>
              <p className="mt-2">When you place an order on WhatsApp or phone, we collect your name, delivery address, mobile number and order details. The website itself does not require an account for browsing.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">2. How We Use It</h2>
              <p className="mt-2">Your details are used only to confirm, pack, ship and deliver your order, and to communicate with you about that order. We do not send promotional spam.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">3. Payment Data</h2>
              <p className="mt-2">We do not store, see or process any card / net-banking details. All payments happen directly through UPI, bank transfer or cash.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">4. Sharing</h2>
              <p className="mt-2">We share only the minimum required information (name, address, mobile) with our courier partner to deliver your order. We never sell your data to any third party.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">5. Cookies</h2>
              <p className="mt-2">This website uses basic cookies to keep your cart and preferences working. No third-party advertising trackers are used.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">6. Your Rights</h2>
              <p className="mt-2">You may email us to request deletion of your order-related information after your order is fulfilled and its return window is over.</p>
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-secondary">7. Contact</h2>
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
