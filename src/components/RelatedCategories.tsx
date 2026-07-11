import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type Cat = {
  to: "/bedsheets" | "/nighty" | "/men-shirts" | "/products";
  title: string;
  desc: string;
  gradient: string;
};

const ALL: Cat[] = [
  {
    to: "/bedsheets",
    title: "Pure Cotton Bedsheets",
    desc: "King, Queen & Single size — Jaipuri prints",
    gradient: "from-rose-100 to-pink-50",
  },
  {
    to: "/nighty",
    title: "Cotton Nighty for Women",
    desc: "Soft, breathable everyday comfort",
    gradient: "from-fuchsia-100 to-rose-50",
  },
  {
    to: "/men-shirts",
    title: "Printed Cotton Shirts",
    desc: "Half & full sleeve — pure cotton for men",
    gradient: "from-amber-100 to-orange-50",
  },
  {
    to: "/products",
    title: "All Products",
    desc: "Browse our complete Jaipur cotton range",
    gradient: "from-sky-100 to-indigo-50",
  },
];

export function RelatedCategories({ exclude }: { exclude: Cat["to"] }) {
  const items = ALL.filter((c) => c.to !== exclude);
  return (
    <section className="mt-16 border-t border-brand-soft/60 pt-10">
      <h2 className="text-2xl font-bold text-brand-secondary">Explore related categories</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        More handpicked pure cotton essentials from MEENU COLLECTION Jaipur.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br ${c.gradient} p-5 shadow-soft ring-1 ring-brand-primary/10 transition-all hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-primary/30`}
          >
            <div>
              <h3 className="text-base font-black text-brand-secondary">{c.title}</h3>
              <p className="mt-1 text-xs text-brand-secondary/70">{c.desc}</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-primary shadow-soft transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
