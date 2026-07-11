import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Eye } from "lucide-react";
import { getVisitorStats } from "@/lib/visitors.functions";
import { subscribeLiveCount } from "@/lib/visitor-tracker";
import { supabase } from "@/integrations/supabase/client";

function useLiveVisitorCount(): number {
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = subscribeLiveCount((n) => setCount(n));
    return () => unsub();
  }, []);
  return count;
}

function formatHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });
}

export function AdminVisitorPanel() {
  const live = useLiveVisitorCount();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "visitor-stats"],
    queryFn: () => getVisitorStats(),
    refetchInterval: 30_000,
  });

  // realtime: refetch on any new insert
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel("admin-visitor-events")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "visitor_events" },
          () => refetch(),
        )
        .subscribe();
    } catch {
      /* ignore */
    }
    return () => {
      if (ch) try { supabase.removeChannel(ch); } catch { /* noop */ }
    };
  }, [refetch]);

  const maxVisits = Math.max(1, ...(data?.hourly?.map((h) => h.visits) ?? [1]));

  return (
    <section className="rounded-3xl bg-gradient-to-br from-brand-secondary via-brand-secondary to-slate-900 p-5 text-white shadow-lift ring-1 ring-white/10 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">Live Traffic</p>
          <h2 className="mt-0.5 text-xl font-black tracking-tight">Buyer activity — last 24 hours</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="tabular-nums">{live}</span> live now
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatTile icon={Users} label="Live visitors" value={live} tint="from-emerald-400 to-teal-500" />
        <StatTile
          icon={Eye}
          label="Visits (24h)"
          value={isLoading ? "—" : (data?.last24hVisits ?? 0).toLocaleString("en-IN")}
          tint="from-sky-400 to-blue-500"
        />
        <StatTile
          icon={TrendingUp}
          label="Unique buyers (24h)"
          value={isLoading ? "—" : (data?.last24hUniqueSessions ?? 0).toLocaleString("en-IN")}
          tint="from-fuchsia-400 to-purple-500"
        />
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
          <span>Hourly visits</span>
          <span>{data?.hourly?.length ?? 0} hrs</span>
        </div>
        <div className="flex h-32 items-end gap-1">
          {(data?.hourly ?? Array.from({ length: 24 }, () => ({ hour: "", visits: 0, sessions: 0 }))).map((h, i) => {
            const pct = (h.visits / maxVisits) * 100;
            return (
              <div key={i} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-brand-primary/60 to-brand-primary transition-all"
                  style={{ height: `${Math.max(3, pct)}%` }}
                  title={h.hour ? `${formatHour(h.hour)} — ${h.visits} visits, ${h.sessions} unique` : ""}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/50 tabular-nums">
          <span>{data?.hourly?.[0]?.hour ? formatHour(data.hourly[0].hour) : "—"}</span>
          <span>Now</span>
        </div>
      </div>

      {data?.topPaths && data.topPaths.length > 0 && (
        <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Top pages (24h)</p>
          <ul className="divide-y divide-white/5">
            {data.topPaths.map((p) => (
              <li key={p.path} className="flex items-center justify-between py-1.5 text-sm">
                <span className="truncate font-medium text-white/90">{p.path}</span>
                <span className="ml-3 tabular-nums text-white/70">{p.visits}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[10px] text-white/40">
        Data auto-clears after 24 hours. Live count updates in real time.
      </p>
    </section>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{label}</p>
      <p className="mt-0.5 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}
