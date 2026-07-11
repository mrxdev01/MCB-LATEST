import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  accent?: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHero({ eyebrow, title, accent, description, icon: Icon = Sparkles }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* base gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#fff5f7_0%,#ffe8ee_45%,#fde4d3_100%)]"
      />
      {/* aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 hero-aurora"
      />
      {/* grid lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-40 hero-grid-lines" />
      {/* blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-20 top-10 -z-10 h-56 w-56 rounded-full bg-brand-primary/25 blur-3xl hero-blob" />
      <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl hero-blob-slow" />

      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary shadow-soft ring-1 ring-brand-primary/15 backdrop-blur">
            <Icon className="h-3 w-3" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-brand-secondary sm:text-5xl md:text-6xl">
          {title}{" "}
          {accent && (
            <span className="relative inline-block text-brand-primary">
              {accent}
              <svg
                aria-hidden
                viewBox="0 0 220 10"
                className="absolute -bottom-1 left-0 h-2 w-full text-brand-primary/70"
                preserveAspectRatio="none"
              >
                <path d="M2 6 Q 60 1 120 5 T 218 3" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-secondary/70 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
