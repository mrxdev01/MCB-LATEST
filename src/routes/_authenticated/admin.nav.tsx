import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Plus, Save, GripVertical } from "lucide-react";
import { listNavItemsAdmin, upsertNavItem, deleteNavItem, type NavItem } from "@/lib/nav.functions";

export const Route = createFileRoute("/_authenticated/admin/nav")({
  component: AdminNav,
});

function AdminNav() {
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({ queryKey: ["admin", "nav"], queryFn: () => listNavItemsAdmin() });
  const [draft, setDraft] = useState({ label: "", url: "", sort_order: 100 });

  const save = useMutation({
    mutationFn: (v: { id?: string; label: string; url: string; sort_order: number; is_visible: boolean }) => upsertNavItem({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "nav"] }); qc.invalidateQueries({ queryKey: ["nav-items"] }); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteNavItem({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "nav"] }); qc.invalidateQueries({ queryKey: ["nav-items"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Site</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-secondary">Navbar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add, hide, rename or remove navbar links. Lower sort number appears first.</p>
      </header>

      {/* Add new */}
      <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-brand-primary/10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-secondary">Add new link</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr_100px_auto]">
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Label (e.g. Kurti)" className="rounded-lg border border-input bg-white px-3 py-2 text-sm" />
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="URL (/kurti or /collections/xxx)" className="rounded-lg border border-input bg-white px-3 py-2 text-sm" />
          <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} className="rounded-lg border border-input bg-white px-3 py-2 text-sm" />
          <button
            onClick={() => {
              if (!draft.label || !draft.url) return toast.error("Label & URL required");
              save.mutate({ label: draft.label, url: draft.url, sort_order: draft.sort_order, is_visible: true });
              setDraft({ label: "", url: "", sort_order: 100 });
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </section>

      {/* List */}
      <section className="rounded-2xl bg-white shadow-soft ring-1 ring-brand-primary/10">
        <div className="border-b border-brand-primary/10 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-secondary">Current items ({items?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-brand-primary/5">
          {isLoading && <p className="px-5 py-6 text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (items ?? []).length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">No items yet. Add your first link above.</p>
          )}
          {(items ?? []).map((it) => <Row key={it.id} item={it} onSave={(v) => save.mutate(v)} onDelete={() => del.mutate(it.id)} />)}
        </div>
      </section>
    </div>
  );
}

function Row({ item, onSave, onDelete }: { item: NavItem; onSave: (v: { id: string; label: string; url: string; sort_order: number; is_visible: boolean }) => void; onDelete: () => void }) {
  const [v, setV] = useState({ label: item.label, url: item.url, sort_order: item.sort_order, is_visible: item.is_visible });
  const dirty = v.label !== item.label || v.url !== item.url || v.sort_order !== item.sort_order || v.is_visible !== item.is_visible;
  return (
    <div className="grid grid-cols-[auto_1fr_1.4fr_80px_auto_auto_auto] items-center gap-2 px-4 py-3">
      <GripVertical className="h-4 w-4 text-brand-secondary/30" />
      <input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} className="rounded-lg border border-input bg-white px-2.5 py-1.5 text-sm" />
      <input value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} className="rounded-lg border border-input bg-white px-2.5 py-1.5 text-sm" />
      <input type="number" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} className="rounded-lg border border-input bg-white px-2.5 py-1.5 text-sm" />
      <button
        title={v.is_visible ? "Hide" : "Show"}
        onClick={() => { const nv = { ...v, is_visible: !v.is_visible }; setV(nv); onSave({ id: item.id, ...nv }); }}
        className={`grid h-8 w-8 place-items-center rounded-full ${v.is_visible ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`}
      >
        {v.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button
        disabled={!dirty}
        onClick={() => onSave({ id: item.id, ...v })}
        className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-40"
      >
        <Save className="h-3 w-3" /> Save
      </button>
      <button
        onClick={() => { if (confirm(`Delete "${item.label}"?`)) onDelete(); }}
        className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
