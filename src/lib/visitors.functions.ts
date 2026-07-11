import { createServerFn } from "@tanstack/react-start";
import { type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(ctx: { supabase: SupabaseClient; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!isAdmin) throw new Response("Forbidden", { status: 403 });
}

export type VisitorStats = {
  last24hVisits: number;
  last24hUniqueSessions: number;
  hourly: { hour: string; visits: number; sessions: number }[]; // 24 buckets, oldest → newest
  topPaths: { path: string; visits: number }[];
};

type VisitorRow = { created_at: string; session_id: string; path: string | null };

export const getVisitorStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VisitorStats> => {
    await ensureAdmin(context);

    // Safety-net cleanup in case pg_cron job hasn't run yet
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("visitor_events" as any) as any).delete().lt("created_at", cutoff);
    } catch {
      /* ignore */
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase.from("visitor_events" as any) as any)
      .select("created_at, session_id, path")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;
    const rows = (data ?? []) as VisitorRow[];

    // Build 24 hourly buckets ending at the current hour
    const anchor = new Date();
    anchor.setMinutes(0, 0, 0);
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(anchor.getTime() - (23 - i) * 60 * 60 * 1000);
      return { hour: d.toISOString(), visits: 0, sessions: new Set<string>() };
    });
    const firstHourMs = new Date(buckets[0].hour).getTime();

    const sessions = new Set<string>();
    const pathCount = new Map<string, number>();

    for (const row of rows) {
      const t = new Date(row.created_at).getTime();
      const idx = Math.floor((t - firstHourMs) / (60 * 60 * 1000));
      if (idx >= 0 && idx < 24) {
        buckets[idx].visits += 1;
        buckets[idx].sessions.add(row.session_id);
      }
      sessions.add(row.session_id);
      const p = row.path ?? "/";
      pathCount.set(p, (pathCount.get(p) ?? 0) + 1);
    }

    const topPaths = Array.from(pathCount.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);

    return {
      last24hVisits: rows.length,
      last24hUniqueSessions: sessions.size,
      hourly: buckets.map((b) => ({ hour: b.hour, visits: b.visits, sessions: b.sessions.size })),
      topPaths,
    };
  });
