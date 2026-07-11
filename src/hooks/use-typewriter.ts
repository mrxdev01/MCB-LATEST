import { useEffect, useState } from "react";

/**
 * Typewriter placeholder that types → pauses → deletes → cycles through phrases.
 * Returns a plain string safe to pass as an <input placeholder="...">.
 * SSR-safe: starts with the first phrase fully typed so server & client match.
 */
export function useTypewriterPlaceholder(
  phrases: readonly string[],
  opts: { typeMs?: number; deleteMs?: number; holdMs?: number; prefix?: string } = {},
) {
  const { typeMs = 75, deleteMs = 35, holdMs = 1400, prefix = "" } = opts;
  const [text, setText] = useState(phrases[0] ?? "");
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting">("hold");

  useEffect(() => {
    if (!phrases.length) return;
    const current = phrases[i % phrases.length];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      } else {
        timer = setTimeout(() => setPhase("hold"), 20);
      }
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("deleting"), holdMs);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteMs);
      } else {
        setI((v) => (v + 1) % phrases.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, i, phrases, typeMs, deleteMs, holdMs]);

  return `${prefix}${text}`;
}
