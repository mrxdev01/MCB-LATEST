import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, X, ChevronRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/brand";
import { useTypewriterPlaceholder } from "@/hooks/use-typewriter";
import { listNavItems, type NavItem } from "@/lib/nav.functions";
const logo = "/logo.png";

const SEARCH_PHRASES = [
  "Bedsheet",
  "Men Shirts",
  "Cotton Bedsheet",
  "Single Bedsheet",
  "Double Bedsheet",
  "Cotton Nighty",
  "King Size Bedsheet",
] as const;

const FALLBACK: NavItem[] = [
  { id: "f-home", label: "Home", url: "/", sort_order: 10, is_visible: true },
  { id: "f-bed", label: "Bedsheets", url: "/bedsheets", sort_order: 20, is_visible: true },
  { id: "f-shirts", label: "Men Shirts", url: "/men-shirts", sort_order: 30, is_visible: true },
  { id: "f-nighty", label: "Nighty", url: "/nighty", sort_order: 40, is_visible: true },
  { id: "f-all", label: "All Products", url: "/products", sort_order: 50, is_visible: true },
  { id: "f-about", label: "About", url: "/about", sort_order: 60, is_visible: true },
  { id: "f-contact", label: "Contact", url: "/contact", sort_order: 70, is_visible: true },
];

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mq, setMq] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const typedPlaceholder = useTypewriterPlaceholder(SEARCH_PHRASES, {
    prefix: "Search ",
    typeMs: 70,
    deleteMs: 30,
    holdMs: 1300,
  });

  const { data: navItems } = useQuery({
    queryKey: ["nav-items"],
    queryFn: () => listNavItems(),
    // Rely on global 60s staleTime + realtime invalidation on the `nav_items`
    // table (see __root.tsx RealtimeSync). No per-navigation refetch storm.
    placeholderData: FALLBACK,
  });

  const NAV = (navItems && navItems.length > 0 ? navItems : FALLBACK);

  const submit = (value: string, closeMenu = false) => {
    const trimmed = value.trim();
    navigate({ to: "/products", search: trimmed ? { q: trimmed } : {} });
    if (closeMenu) setOpen(false);
    setMobileSearchOpen(false);
  };

  const onDesktopSubmit = (e: FormEvent) => { e.preventDefault(); submit(q); };
  const onMobileSubmit = (e: FormEvent) => { e.preventDefault(); submit(mq, true); };

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar />
      <div className="relative border-b border-brand-primary/15 bg-gradient-to-r from-brand-soft/90 via-background/85 to-brand-soft/90 shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--color-brand-primary)_25%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-brand-soft/70 supports-[backdrop-filter]:via-background/60 supports-[backdrop-filter]:to-brand-soft/70">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 sm:gap-4">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <img
              src={logo}
              alt={BRAND.name}
              width={56}
              height={56}
              fetchPriority="high"
              className="size-11 rounded-full bg-white object-contain p-[2px] ring-2 ring-brand-primary/20 shadow-soft sm:size-[52px]"
            />
            <span className="hidden min-w-0 leading-tight sm:block">
              <span className="block truncate bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary bg-clip-text text-[15px] font-black tracking-tight text-transparent">
                {BRAND.name}
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-brand-primary/80">
                Jaipur · Pure Cotton
              </span>
            </span>
          </Link>

          <form
            onSubmit={onDesktopSubmit}
            className="group ml-2 hidden max-w-md flex-1 items-center gap-2 rounded-full bg-brand-soft/50 px-4 py-2.5 ring-1 ring-brand-primary/15 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/40 md:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-brand-primary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={typedPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-brand-secondary placeholder:text-brand-secondary/50 focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Go
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.slice(0, 5).map((n) => (
              <NavLink key={n.id} to={n.url} label={n.label} />
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-brand-secondary transition-colors hover:bg-brand-soft md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-brand-secondary transition-colors hover:bg-brand-soft"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-[10px] font-black text-primary-foreground ring-2 ring-background">
                  {count}
                </span>
              )}
            </Link>
            <button
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full text-brand-secondary transition-colors hover:bg-brand-soft lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-brand-primary/10 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <form
              onSubmit={onMobileSubmit}
              className="flex items-center gap-2 rounded-full bg-brand-soft/50 px-4 py-2.5 ring-1 ring-brand-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/40"
            >
              <Search className="h-4 w-4 shrink-0 text-brand-primary" />
              <input
                autoFocus
                value={mq}
                onChange={(e) => setMq(e.target.value)}
                placeholder={typedPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-lift">
            <div className="flex items-center justify-between border-b border-brand-primary/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" className="size-9 rounded-full ring-2 ring-brand-soft" />
                <span className="text-sm font-black text-brand-secondary">{BRAND.name}</span>
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand-soft">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onMobileSubmit} className="mx-4 mt-4 flex items-center gap-2 rounded-full bg-brand-soft/60 px-4 py-2.5 ring-1 ring-brand-primary/15">
              <Search className="h-4 w-4 text-brand-primary" />
              <input
                value={mq}
                onChange={(e) => setMq(e.target.value)}
                placeholder={typedPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </form>

            <nav className="mt-2 flex flex-col p-2">
              {NAV.map((n) => (
                <NavLink key={n.id} to={n.url} label={n.label} onClick={() => setOpen(false)} mobile />
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Handles both internal (/foo) and external (https://…) URLs.
 * TanStack Router's <Link to> is typed to known routes only, so unknown
 * internal paths (user-added) fall back to <a> — still SPA-friendly via server render, and safe.
 */
function NavLink({ to, label, onClick, mobile }: { to: string; label: string; onClick?: () => void; mobile?: boolean }) {
  const isExternal = /^https?:\/\//i.test(to);
  const desktopCls = "rounded-full px-3 py-1.5 text-[13px] font-semibold text-brand-secondary/75 transition-colors hover:bg-brand-soft/60 hover:text-brand-primary";
  const mobileCls = "group flex items-center justify-between rounded-2xl px-3 py-3 text-[15px] font-semibold text-brand-secondary transition-colors hover:bg-brand-soft";
  const cls = mobile ? mobileCls : desktopCls;
  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {label}
        {mobile && <ChevronRight className="h-4 w-4 opacity-50" />}
      </a>
    );
  }
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cls}
      activeProps={{
        className: mobile
          ? "flex items-center justify-between rounded-2xl px-3 py-3 text-[15px] font-semibold bg-brand-primary/10 text-brand-primary"
          : "rounded-full px-3 py-1.5 text-[13px] font-semibold bg-brand-primary/10 text-brand-primary",
      }}
    >
      {label}
      {mobile && <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />}
    </Link>
  );
}
