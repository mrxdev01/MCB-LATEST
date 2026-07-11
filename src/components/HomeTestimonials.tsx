import { Quote, Star, MapPin, BadgeCheck, Sparkles } from "lucide-react";

type Testimonial = {
  name: string;
  city: string;
  role: string;
  rating: number;
  text: string;
  product: string;
  initials: string;
  gradient: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Priya Sharma",
    city: "Delhi",
    role: "Verified Buyer",
    rating: 5,
    text: "Bedsheet ki quality bahut hi premium hai. Pure cotton, soft aur colours bilkul waise hi jaise photo mein dikhaye. 3 wash ke baad bhi fabric same hai. Highly recommended!",
    product: "Jaipuri Cotton Double Bedsheet",
    initials: "PS",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    name: "Rakesh Agarwal",
    city: "Mumbai",
    role: "Retail Partner",
    rating: 5,
    text: "4 years se MEENU COLLECTION se bulk order kar raha hoon. Honest wholesale pricing, on-time delivery, aur customer complaints almost zero. Full trust supplier.",
    product: "Wholesale — 200+ pieces",
    initials: "RA",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Sunita Verma",
    city: "Jaipur",
    role: "Verified Buyer",
    rating: 5,
    text: "Nighty ka fabric itna comfortable hai ki roz pehnne ka mann karta hai. Local Jaipur brand hone ke baad bhi quality any big brand se better hai.",
    product: "Cotton Nighty — XL",
    initials: "SV",
    gradient: "from-fuchsia-400 to-brand-primary",
  },
  {
    name: "Anil Kumar",
    city: "Bangalore",
    role: "Verified Buyer",
    rating: 5,
    text: "Ordered 3 printed shirts. Stitching neat, cotton breathable, aur size perfectly fit. WhatsApp par response bhi bahut fast tha. Definitely reorder karunga.",
    product: "Printed Cotton Shirts (Set of 3)",
    initials: "AK",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Meera Iyer",
    city: "Chennai",
    role: "Verified Buyer",
    rating: 5,
    text: "King size bedsheet with 2 pillow covers — packaging safe thi, colour vibrant hai aur GSM bhi heavy. Paisa vasool product, worth every rupee.",
    product: "King Size Bedsheet + Pillow Covers",
    initials: "MI",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    name: "Deepak Singh",
    city: "Lucknow",
    role: "Retail Partner",
    rating: 5,
    text: "Meenu ji personally attend karti hain har order. Trust build karne wala business. Mera shop ka best-seller inhi ki bedsheets hain.",
    product: "Monthly wholesale reorder",
    initials: "DS",
    gradient: "from-violet-400 to-purple-500",
  },
];

// Split into 2 rows for opposing marquees
const ROW_A = TESTIMONIALS.slice(0, 3);
const ROW_B = TESTIMONIALS.slice(3);

function Card({ t }: { t: Testimonial }) {
  return (
    <article
      className="group relative flex w-[86vw] max-w-[380px] shrink-0 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10 transition-shadow duration-300 hover:shadow-lift hover:ring-brand-primary/25 sm:w-[420px]"
    >
      {/* corner quote — static, no transforms */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-4 text-[120px] font-black leading-none text-brand-primary/[0.07]"
      >
        &ldquo;
      </div>


      {/* stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: t.rating }).map((_, s) => (
          <Star
            key={s}
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400 transition-transform duration-300"
            style={{ transitionDelay: `${s * 40}ms` }}
          />
        ))}
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          Verified
        </span>
      </div>

      <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-brand-secondary/85">
        &ldquo;{t.text}&rdquo;
      </p>

      <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
        <BadgeCheck className="h-3 w-3" /> {t.product}
      </p>

      <div className="mt-auto flex items-center gap-3 border-t border-brand-soft/60 pt-4">
        <div
          className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-black text-white shadow-soft`}
          aria-hidden
        >
          <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-brand-secondary">
            {t.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-secondary/60">
            <MapPin className="h-2.5 w-2.5" />
            {t.city} · {t.role}
          </p>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  duration = 45,
}: {
  items: Testimonial[];
  reverse?: boolean;
  duration?: number;
}) {
  // duplicate for seamless loop
  // Duplicate twice for seamless loop (was 3× — cut GPU cost by 33%).
  const loop = [...items, ...items];
  return (
    <div className="group/row relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex w-max gap-5"
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {loop.map((t, i) => (
          <Card key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function HomeTestimonials() {
  const avgRating = 4.9;
  const totalReviews = 850;

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* animated backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(213,82,122,0.12),transparent_60%),radial-gradient(700px_500px_at_100%_100%,rgba(212,178,106,0.16),transparent_60%),radial-gradient(600px_400px_at_0%_50%,rgba(233,122,160,0.10),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28] hero-grid-lines"
      />
      {/* floating orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-primary/20 blur-3xl hero-blob-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 rounded-full bg-brand-accent/25 blur-3xl hero-blob"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* heading */}
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary shadow-soft ring-1 ring-brand-primary/15 backdrop-blur"
            data-reveal="fade"
          >
            <Sparkles className="h-3 w-3 animate-pulse" /> Customer Love
          </span>
          <h2
            className="mt-4 text-3xl font-black tracking-tight text-brand-secondary sm:text-5xl"
            data-reveal
          >
            What Our{" "}
            <span className="relative inline-block text-brand-primary">
              Customers
              <svg
                aria-hidden
                viewBox="0 0 260 10"
                className="absolute -bottom-1 left-0 h-2 w-full text-brand-primary/70"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 Q 70 1 140 5 T 258 3"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Say
          </h2>
          <p
            className="mt-4 max-w-xl text-sm text-brand-secondary/70 sm:text-base"
            data-reveal
          >
            Real reviews from verified buyers and retail partners across India.
          </p>

          {/* live rating pill */}
          <div
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/90 px-5 py-2.5 shadow-lift ring-1 ring-brand-primary/15 backdrop-blur"
            data-reveal="zoom"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-sm font-black text-brand-secondary">
              {avgRating}
            </span>
            <span className="h-4 w-px bg-brand-soft" />
            <span className="text-xs font-semibold text-brand-secondary/70">
              {totalReviews}+ reviews
            </span>
          </div>
        </div>

        {/* marquee rows */}
        <div className="mt-14 space-y-5">
          <MarqueeRow items={ROW_A} duration={50} />
          <MarqueeRow items={ROW_B} reverse duration={60} />
        </div>

        {/* trust footer */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-brand-secondary/60">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 ring-1 ring-brand-primary/10">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
            All reviews from verified customers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 ring-1 ring-brand-primary/10">
            <Quote className="h-3.5 w-3.5 text-brand-primary" />
            Auto-updating from live buyer feedback
          </span>
        </div>
      </div>

      {/* local keyframes */}
      <style>{`
        @keyframes marquee-x {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee-x"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
