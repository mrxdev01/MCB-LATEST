import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck, Video, Clock, ShieldAlert, Mail, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageHero } from "@/components/PageHero";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/return-refund")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy — MEENU COLLECTION" },
      { name: "description", content: "Our multi-step quality check, packaging video proof, and the 3-day return window for genuine issues. Read the full policy." },
      { property: "og:title", content: "Return & Refund Policy — MEENU COLLECTION" },
      { property: "og:description", content: "Multi-step QC, packaging video proof, 3-day genuine-issue window with unboxing video required." },
    ],
    links: [{ rel: "canonical", href: canonical("/return-refund") }],
  }),
  component: ReturnRefund,
});

const STEPS = [
  { icon: PackageCheck, t: "Multi-step Quality Check", s: "Every product passes through several manual inspection rounds — fabric, stitching, colour, print alignment, and packing — before it leaves our shop in Jaipur." },
  { icon: Video, t: "Packaging Video Proof", s: "We record a full packing video of your order (product + weighing + sealing). This proves the exact condition in which the parcel left our facility." },
  { icon: Clock, t: "3-Day Return Window", s: "In the rare 1% case of a genuine issue, you MUST raise the request within 3 days of delivery — with clear photos AND a complete unboxing video that starts before the sealed parcel is opened." },
  { icon: ShieldAlert, t: "Investigation by Our Team", s: "Our team compares your unboxing video with our packing video and evaluates the images. This decides whether the return is genuine or not." },
  { icon: Mail, t: "24-Hour Email Decision", s: "Within 24 hours of receiving your complete evidence, we will email you the resolution — approved return / replacement / refund, or rejection with reason." },
  { icon: XCircle, t: "Full Right to Reject", s: "MEENU COLLECTION reserves the full right to cancel any return or refund request if the claim looks tampered, edited, incomplete, without an unboxing video, or not genuine after investigation." },
];

function ReturnRefund() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero
          eyebrow="Policy"
          title="Return &"
          accent="Refund"
          description="Because we quality-check and video-record every parcel, 99% orders never face an issue. Here's exactly what happens in the 1% case."
          icon={PackageCheck}
        />

        <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <div className="rounded-3xl border border-brand-primary/15 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-black text-brand-secondary sm:text-2xl">Our Promise</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-secondary/80">
              At {BRAND.name}, every product is dispatched only after multiple rounds of manual checking and a full packaging video is recorded. Because of this, <strong>99% of orders never face any issue</strong>. But if something genuinely goes wrong in the remaining 1%, this policy explains the exact process — the window, the proof we need, and how the decision is made.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {STEPS.map(({ icon: Icon, t, s }) => (
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
            <h2 className="text-xl font-black text-brand-secondary sm:text-2xl">Mandatory Evidence for Any Claim</h2>
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-brand-secondary/80">
              <li>• <strong>Complete unboxing video</strong> — recording MUST start with the sealed parcel visible, then open it in one continuous take. Cut/edited videos are not accepted.</li>
              <li>• <strong>Clear photos</strong> of the exact defect, damage, or issue.</li>
              <li>• <strong>Order details</strong> — order id, product name, and delivery date.</li>
              <li>• Request must be raised within <strong>3 days</strong> from delivery date. After 3 days no request is accepted.</li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl border border-destructive/20 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-black text-brand-secondary sm:text-2xl">What Is NOT Covered</h2>
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-brand-secondary/80">
              <li>• Minor colour variation because of screen / lighting differences (cotton is a natural fabric).</li>
              <li>• Slight 1–2 inch size difference which is normal in handloom/printed cotton.</li>
              <li>• Return requests without an unboxing video, or with a cut / edited video.</li>
              <li>• Requests raised after the 3-day window.</li>
              <li>• Any claim that our investigation finds tampered, dishonest, or not genuine.</li>
            </ul>
            <p className="mt-4 text-sm italic text-brand-secondary/70">
              MEENU COLLECTION holds the complete right to reject and cancel any return / refund request that does not meet the above conditions, or is found dishonest after investigation.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl bg-brand-secondary p-6 text-primary-foreground sm:p-8">
            <h2 className="text-xl font-black sm:text-2xl">How to Raise a Request</h2>
            <ol className="mt-4 space-y-2 text-[15px] leading-relaxed opacity-90">
              <li>1. Email us at <a className="underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or WhatsApp <a className="underline" href={`https://wa.me/${BRAND.whatsapp}`}>{BRAND.whatsappDisplay}</a> within 3 days.</li>
              <li>2. Share your order id, photos, and the full unboxing video.</li>
              <li>3. Our team investigates and emails the final resolution within <strong>24 hours</strong>.</li>
              <li>4. If approved — refund / replacement is initiated as per the decision.</li>
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
