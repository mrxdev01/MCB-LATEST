import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getActiveAnnouncement } from "@/lib/announcements.functions";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBar() {
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const { data } = useQuery({
    queryKey: ["announcements", "active"],
    queryFn: () => getActiveAnnouncement(),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    try {
      const ch = supabase
        .channel("ann-rt")
        .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () =>
          qc.invalidateQueries({ queryKey: ["announcements"] }),
        )
        .subscribe();
      return () => {
        supabase.removeChannel(ch);
      };
    } catch {
      // supabase not configured — ignore
    }
  }, [qc]);

  if (!data || dismissed) return null;

  return (
    <div
      style={{ backgroundColor: data.bg_color, color: data.text_color }}
      className="relative w-full px-4 py-2 text-center text-sm"
    >
      <span>{data.message}</span>
      <button
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
