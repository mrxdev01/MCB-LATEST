import { useMemo } from "react";
import { Sparkles, Check } from "lucide-react";

type Block =
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string }
  | { kind: "bullets"; items: { label?: string; value: string }[] };

// Splits plain-text product description into styled blocks.
function parse(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paraBuf: string[] = [];
  let bulletBuf: { label?: string; value: string }[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      blocks.push({ kind: "para", text: paraBuf.join(" ").trim() });
      paraBuf = [];
    }
  };
  const flushBullets = () => {
    if (bulletBuf.length) {
      blocks.push({ kind: "bullets", items: bulletBuf });
      bulletBuf = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushBullets();
      continue;
    }
    if (/^[•\-*]\s+/.test(line)) {
      flushPara();
      const rest = line.replace(/^[•\-*]\s+/, "");
      const m = rest.match(/^([^:]{1,32}):\s*(.+)$/);
      if (m) bulletBuf.push({ label: m[1].trim(), value: m[2].trim() });
      else bulletBuf.push({ value: rest });
      continue;
    }
    if (line.length <= 48 && line.endsWith(":") && !line.slice(0, -1).includes(":")) {
      flushPara();
      flushBullets();
      blocks.push({ kind: "heading", text: line.slice(0, -1) });
      continue;
    }
    flushBullets();
    paraBuf.push(line);
  }
  flushPara();
  flushBullets();
  return blocks;
}

// Highlights numbers, units and quoted phrases in a paragraph.
function enrich(text: string) {
  const parts = text.split(/(\b\d+(?:[.,]\d+)?\s?(?:%|x|X|cm|mm|inch|inches|g|kg|GSM|gsm|TC|tc|ml|L)?\b|"[^"]+")/g);
  return parts.map((p, i) => {
    if (/^\d/.test(p) || /^"/.test(p)) {
      return (
        <strong key={i} className="font-semibold text-brand-secondary">
          {p.replace(/^"|"$/g, "")}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function ProductDescription({ text }: { text: string }) {
  const blocks = useMemo(() => parse(text), [text]);
  return (
    <section
      className="overflow-hidden rounded-3xl border border-brand-soft/60 bg-gradient-to-b from-white to-brand-soft/10 shadow-soft"
      style={{ contentVisibility: "auto" }}
    >
      <header className="flex items-center gap-2.5 border-b border-brand-soft/60 bg-gradient-to-r from-brand-primary/8 via-brand-soft/25 to-transparent px-5 py-3.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-primary/15 text-brand-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-brand-secondary">
          Product Details
        </h2>
      </header>
      <div className="space-y-5 px-5 py-6 text-[15px] leading-[1.75] text-brand-secondary/90 sm:px-6">
        {blocks.map((b, i) => {
          if (b.kind === "heading") {
            return (
              <h3
                key={i}
                className="relative pl-3 pt-1 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-primary before:absolute before:left-0 before:top-1/2 before:h-4 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-brand-primary"
              >
                {b.text}
              </h3>
            );
          }
          if (b.kind === "bullets") {
            return (
              <ul key={i} className="grid gap-2.5 sm:grid-cols-2">
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className="group flex items-start gap-2.5 rounded-2xl border border-brand-soft/40 bg-white/70 px-3.5 py-2.5 backdrop-blur-sm transition-colors hover:border-brand-primary/40 hover:bg-white"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-primary/12 text-brand-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <div className="min-w-0 text-[14px] leading-snug">
                      {it.label && (
                        <span className="font-bold text-brand-secondary">
                          {it.label}:{" "}
                        </span>
                      )}
                      <span className="text-brand-secondary/85">{it.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-brand-secondary/85 first:mt-0 first:text-[15.5px] first:font-medium first:text-brand-secondary">
              {enrich(b.text)}
            </p>
          );
        })}
      </div>
    </section>
  );
}
