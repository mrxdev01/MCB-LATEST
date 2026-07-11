import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  listAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  setAnnouncementActive,
} from "@/lib/announcements.functions";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: Announcements,
});

function Announcements() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "announcements"], queryFn: () => listAnnouncements() });
  const [message, setMessage] = useState("");
  const [bg, setBg] = useState("#D5527A");
  const [text, setText] = useState("#ffffff");

  const save = useMutation({
    mutationFn: (v: { message: string; bg_color: string; text_color: string; is_active: boolean }) => saveAnnouncement({ data: v }),
    onSuccess: () => { toast.success("Saved"); setMessage(""); qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); qc.invalidateQueries({ queryKey: ["announcements"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteAnnouncement({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); qc.invalidateQueries({ queryKey: ["announcements"] }); },
  });
  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => setAnnouncementActive({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); qc.invalidateQueries({ queryKey: ["announcements"] }); },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!message) return;
    save.mutate({ message, bg_color: bg, text_color: text, is_active: true });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-secondary">Announcements</h1>

      <form onSubmit={submit} className="mb-8 rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="mb-3 text-lg font-semibold text-brand-secondary">New announcement</h2>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Free shipping on orders over ₹1000" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <div className="mt-3 flex gap-4">
          <label className="flex items-center gap-2 text-xs">BG <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></label>
          <label className="flex items-center gap-2 text-xs">Text <input type="color" value={text} onChange={(e) => setText(e.target.value)} /></label>
        </div>
        <div className="mt-4" style={{ backgroundColor: bg, color: text }}>
          <div className="rounded-xl px-4 py-2 text-center text-sm">{message || "Preview"}</div>
        </div>
        <button type="submit" className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-sm text-primary-foreground">Publish</button>
      </form>

      <div className="rounded-2xl bg-card shadow-soft">
        {(data ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-3 border-b border-border p-4 last:border-b-0">
            <div className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: a.bg_color, color: a.text_color }}>{a.message}</div>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={a.is_active} onChange={(e) => toggle.mutate({ id: a.id, active: e.target.checked })} />
              Active
            </label>
            <button onClick={() => { if (confirm("Delete?")) del.mutate(a.id); }} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="p-6 text-center text-muted-foreground">No announcements yet.</p>}
      </div>
    </div>
  );
}
