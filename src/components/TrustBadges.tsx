import { CheckCircle2, ShieldCheck, Truck, Award, Leaf, MapPin } from "lucide-react";
import { BRAND } from "@/lib/brand";

const BADGES = [
  { icon: CheckCircle2, label: "IndiaMART Verified" },
  { icon: ShieldCheck, label: `GST ${BRAND.gst}` },
  { icon: Truck, label: "Pan-India Delivery" },
  { icon: Award, label: "Wholesale Prices" },
  { icon: Leaf, label: "Pure Cotton" },
  { icon: MapPin, label: "Made in Jaipur" },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {BADGES.map((b) => (
        <div
          key={b.label}
          className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-soft"
        >
          <b.icon className="h-5 w-5 shrink-0 text-brand-primary" />
          <span className="text-xs font-medium text-brand-secondary">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
