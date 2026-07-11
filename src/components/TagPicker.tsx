import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listTags, type Tag } from "@/lib/tags.functions";
import { TagChip } from "./TagChip";
import { Plus } from "lucide-react";

export function TagPicker({
  scope,
  value,
  onChange,
}: {
  scope: "product" | "collection" | "category";
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data } = useQuery({ queryKey: ["tags"], queryFn: () => listTags() });
  const tags = (data ?? []).filter((t: Tag) => t.scope === scope || t.scope === "all");

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="rounded-2xl border border-brand-primary/15 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Custom badges</label>
        <Link to="/admin/tags" className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline">
          <Plus className="h-3 w-3" /> Manage tags
        </Link>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Tap any badge to attach it. Changes reflect instantly for all shoppers.</p>
      {tags.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No tags yet. <Link to="/admin/tags" className="text-brand-primary underline">Create your first tag →</Link>
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => {
            const on = value.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={`transition-transform ${on ? "scale-105 ring-2 ring-offset-1 ring-brand-primary rounded-full" : "opacity-70 hover:opacity-100"}`}
                title={t.label}
              >
                <TagChip tag={t} size="md" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
