import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, PlusSquare, Layers, Megaphone, Rows3, Tag, LogOut, ExternalLink, Menu, X, Star, FileText, Navigation } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";

const LINKS: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/new", label: "Add product", icon: PlusSquare },
  { to: "/admin/bulk", label: "Bulk add", icon: Rows3 },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/nav", label: "Navbar", icon: Navigation },
  { to: "/admin/tags", label: "Tags & Badges", icon: Tag },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {LINKS.map((l) => {
        const active = isActive(l.to, l.exact);
        return (
          <Link
            key={l.to}
            to={l.to as never}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-brand-primary text-primary-foreground shadow-soft" : "text-brand-secondary/80 hover:bg-brand-soft/70 hover:text-brand-primary"
            }`}
          >
            <l.icon className={`h-4 w-4 ${active ? "" : "text-brand-primary"}`} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-bg via-white to-brand-soft/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-brand-primary/10 bg-white/70 backdrop-blur lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-brand-primary/10 px-5 py-5">
          <img src="/logo.png" alt="Meenu" className="h-10 w-10 rounded-full bg-white object-contain ring-2 ring-brand-primary/20" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-brand-secondary">MEENU Admin</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-brand-primary/70">Control panel</p>
          </div>
        </div>
        {nav}
        <div className="mt-auto border-t border-brand-primary/10 p-3">
          <p className="truncate px-3 pb-2 text-[11px] text-muted-foreground">{email}</p>
          <div className="flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-brand-secondary/80 hover:bg-brand-soft/70 hover:text-brand-primary">
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/auth" }); }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-brand-primary/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-full bg-brand-soft/70 p-2 text-brand-primary"><Menu className="h-5 w-5" /></button>
        <img src="/logo.png" alt="Meenu" className="h-8 w-8 rounded-full bg-white object-contain ring-1 ring-brand-primary/20" />
        <p className="text-sm font-black text-brand-secondary">MEENU Admin</p>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-primary/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="" className="h-9 w-9 rounded-full bg-white object-contain ring-1 ring-brand-primary/20" />
                <p className="text-sm font-black text-brand-secondary">MEENU Admin</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-brand-secondary/70"><X className="h-4 w-4" /></button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}
