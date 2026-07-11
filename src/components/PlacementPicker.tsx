import { useMemo, useState } from "react";
import { AlertTriangle, MapPin, Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/database-types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Collection = Database["public"]["Tables"]["collections"]["Row"];

export function PlacementPicker({
  categories,
  collections,
  categoryId,
  collectionIds,
  onCategoryChange,
  onCollectionsChange,
}: {
  categories: Category[];
  collections: Collection[];
  categoryId: string | null;
  collectionIds: string[];
  onCategoryChange: (id: string | null) => void;
  onCollectionsChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");

  const roots = useMemo(() => collections.filter((c) => !c.parent_id), [collections]);
  const kidsOf = (id: string) => collections.filter((c) => c.parent_id === id);

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return roots.map((r) => ({ root: r, kids: kidsOf(r.id) }));
    return roots
      .map((r) => ({ root: r, kids: kidsOf(r.id) }))
      .filter(
        (g) =>
          g.root.name.toLowerCase().includes(s) ||
          g.kids.some((k) => k.name.toLowerCase().includes(s)),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, q]);

  const chosenCategory = categories.find((c) => c.id === categoryId);
  const chosenCollections = collections.filter((c) => collectionIds.includes(c.id));
  const nothingPicked = !categoryId && collectionIds.length === 0;

  const toggle = (id: string) =>
    onCollectionsChange(collectionIds.includes(id) ? collectionIds.filter((x) => x !== id) : [...collectionIds, id]);

  const toggleGroup = (root: Collection, kids: Collection[]) => {
    const groupIds = [root.id, ...kids.map((k) => k.id)];
    const allOn = groupIds.every((id) => collectionIds.includes(id));
    onCollectionsChange(
      allOn ? collectionIds.filter((x) => !groupIds.includes(x)) : Array.from(new Set([...collectionIds, ...groupIds])),
    );
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-brand-primary/5 via-white to-amber-50/50 p-5 shadow-soft ring-1 ring-brand-primary/15">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-primary text-white">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">Placement</p>
          <h3 className="text-lg font-black text-brand-secondary">Where should this listing appear?</h3>
          <p className="text-xs text-muted-foreground">Pick a category and any collections/sub-categories — this is what powers your storefront menu.</p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-secondary">Primary category *</label>
        <select
          value={categoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="mt-2 w-full rounded-xl border border-brand-primary/20 bg-white px-3 py-2.5 text-sm font-semibold text-brand-secondary shadow-sm focus:border-brand-primary focus:outline-none"
        >
          <option value="">— Choose a category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Collections */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-secondary">Collections & sub-categories</label>
          <span className="text-[11px] text-muted-foreground">{collectionIds.length} selected</span>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-brand-primary/20 bg-white px-3 py-2">
          <Search className="h-3.5 w-3.5 text-brand-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search collections…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
          {groups.length === 0 && (
            <p className="rounded-xl bg-white/70 px-3 py-4 text-center text-xs text-muted-foreground">
              No collections match. Create some under Collections in the admin.
            </p>
          )}
          {groups.map(({ root, kids }) => {
            const rootOn = collectionIds.includes(root.id);
            const allOn = [root.id, ...kids.map((k) => k.id)].every((id) => collectionIds.includes(id));
            return (
              <div key={root.id} className="rounded-2xl border border-brand-primary/10 bg-white/80 p-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(root.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${rootOn ? "border-brand-primary bg-brand-primary text-primary-foreground" : "border-brand-primary/20 bg-white text-brand-secondary"}`}
                  >
                    {root.name}
                  </button>
                  {kids.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(root, kids)}
                      className="ml-auto text-[10px] font-bold uppercase tracking-wider text-brand-primary hover:underline"
                    >
                      {allOn ? "Clear group" : "Select all"}
                    </button>
                  )}
                </div>
                {kids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-3">
                    {kids.map((k) => {
                      const on = collectionIds.includes(k.id);
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => toggle(k.id)}
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] ${on ? "border-brand-primary bg-brand-primary text-primary-foreground" : "border-brand-primary/15 bg-white text-brand-secondary/80"}`}
                        >
                          ↳ {k.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live summary */}
      <div className="mt-5 rounded-2xl bg-brand-secondary/95 p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">This listing will appear in</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {chosenCategory ? (
            <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-bold">{chosenCategory.name}</span>
          ) : (
            <span className="rounded-full border border-white/30 px-3 py-1 text-xs italic text-white/60">No category</span>
          )}
          {chosenCollections.map((c) => (
            <span key={c.id} className="rounded-full bg-white/15 px-3 py-1 text-xs">{c.name}</span>
          ))}
        </div>
        {nothingPicked && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" /> Pick at least a category or a collection, or shoppers won't see it in the menu.
          </p>
        )}
      </div>
    </section>
  );
}
