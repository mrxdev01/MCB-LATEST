import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Resolve admin check server-side once, before the layout renders, so the
    // admin subtree never shows a "Checking permissions…" flash on navigation.
    const { isAdmin } = await checkIsAdmin();
    return { user: data.user, isAdmin };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, isAdmin } = Route.useRouteContext();
  const router = useRouter();

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <img src="/logo.png" alt="Meenu" className="h-16 w-16 rounded-full bg-white object-contain ring-2 ring-brand-primary/20" />
        <h1 className="text-2xl font-bold text-brand-secondary">Access denied</h1>
        <p className="text-sm text-muted-foreground">Your account ({user.email}) is not an admin.</p>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/auth" }); }}
          className="rounded-full bg-brand-primary px-6 py-2 text-sm text-primary-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <AdminShell email={user.email ?? ""}>
      <Outlet />
    </AdminShell>
  );
}
