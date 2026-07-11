import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Tag as TagIcon } from "lucide-react";
import { listTags, saveTag, deleteTag, type Tag } from "@/lib/tags.functions";
import { TagChip } from "@/components/TagChip";

export const Route = createFileRoute("/_authenticated/admin/tags")({ component: AdminTags });

const PRESETS = ["#d5527a", "#e11d48", "#f59e0b", "#16a34a", "#0ea5e9", "#7c3aed", "#0f172a", "#f5deb3"];

function AdminTags() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tags"], queryFn: () => listTags() });

  const empty: Omit<Tag, "id"> & { id?: string } = { label: "", color: "#d5527a", text_color: "#ffffff", scope: "all", sort_order: 0 };
  const [draft, setDraft] = useState<typeof empty>(empty);

  const save = useMutation({
    mutationFn: (v: typeof empty) => saveTag({ data: v }),
    onSuccess: () => {
      toast.success("Tag saved");
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
      setDraft(empty);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteTag({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Merchandising</p>
        <h1 className="mt-1 text-3xl font-black text-brand-secondary">Custom Tags & Badges</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create badges like <em>Sale</em>, <em>New</em>, <em>Limited</em> with your own colours. They show instantly on products & collections.</p>
      </header>

      {/* Editor */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-brand-primary/10">
          <h2 className="flex items-center gap-2 text-lg font-black text-brand-secondary"><TagIcon className="h-4 w-4 text-brand-primary" /> {draft.id ? "Edit tag" : "Create tag"}</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Label *</label>
              <input value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="e.g. Sale, New, Bestseller" className="mt-1 w-full rounded-xl border border-brand-primary/20 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Show on</label>
              <select value={draft.scope} onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as Tag["scope"] }))} className="mt-1 w-full rounded-xl border border-brand-primary/20 bg-white px-3 py-2 text-sm">
                <option value="all">Everywhere</option>
                <option value="product">Products only</option>
                <option value="collection">Collections only</option>
                <option value="category">Categories only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Background colour</label>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={draft.color} onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))} className="h-10 w-14 cursor-pointer rounded-lg border border-brand-primary/20 bg-white" />
                <input value={draft.color} onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))} className="flex-1 rounded-xl border border-brand-primary/20 bg-white px-3 py-2 font-mono text-sm" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => setDraft((d) => ({ ...d, color: c }))} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Text colour</label>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={draft.text_color} onChange={(e) => setDraft((d) => ({ ...d, text_color: e.target.value }))} className="h-10 w-14 cursor-pointer rounded-lg border border-brand-primary/20 bg-white" />
                <input value={draft.text_color} onChange={(e) => setDraft((d) => ({ ...d, text_color: e.target.value }))} className="flex-1 rounded-xl border border-brand-primary/20 bg-white px-3 py-2 font-mono text-sm" />
              </div>
              <div className="mt-2 flex gap-1">
                {["#ffffff", "#0f172a", "#78350f"].map((c) => (
                  <button key={c} type="button" onClick={() => setDraft((d) => ({ ...d, text_color: c }))} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-5 rounded-2xl border border-dashed border-brand-primary/25 bg-gradient-to-br from-white to-brand-soft/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary/60">Live preview</p>
            <div className="mt-2">
              {draft.label ? <TagChip tag={{ label: draft.label, color: draft.color, text_color: draft.text_color }} size="md" /> : <span className="text-xs text-muted-foreground">Type a label to preview…</span>}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              disabled={!draft.label || save.isPending}
              onClick={() => save.mutate(draft)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-soft disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> {save.isPending ? "Saving…" : draft.id ? "Update tag" : "Create tag"}
            </button>
            {draft.id && (
              <button type="button" onClick={() => setDraft(empty)} className="rounded-full border border-brand-primary/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-secondary">Cancel</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-brand-primary/10">
          <h2 className="flex items-center justify-between text-lg font-black text-brand-secondary">
            <span>All tags</span>
            <button onClick={() => setDraft(empty)} className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-primary hover:text-white"><Plus className="h-3 w-3" /> New</button>
          </h2>

          <div className="mt-4 space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && (data ?? []).length === 0 && (
              <p className="rounded-2xl bg-brand-soft/30 p-4 text-center text-xs text-muted-foreground">No tags yet. Create one on the left. If this list stays empty after saving, run the migration in <code>supabase/migrations/20260710_tags_bestsellers.sql</code>.</p>
            )}
            {(data ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-primary/10 bg-white p-3">
                <div className="flex items-center gap-3">
                  <TagChip tag={t} size="md" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.scope}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setDraft(t)} className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-primary hover:text-white">Edit</button>
                  <button onClick={() => { if (confirm(`Delete "${t.label}"?`)) del.mutate(t.id); }} className="rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
