import type { Tag } from "@/lib/tags.functions";

export function TagChip({ tag, size = "sm" }: { tag: Pick<Tag, "label" | "color" | "text_color">; size?: "sm" | "md" }) {
  const pad = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/5 ${pad}`}
      style={{ background: tag.color, color: tag.text_color }}
    >
      {tag.label}
    </span>
  );
}
