import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Opt-in scroll reveal. Adds `js-reveal` to <html> and observes any element
 * with `data-reveal` or `data-reveal-cascade`, toggling `.is-visible` on
 * intersect. Default CSS state for these elements is visible — the class is
 * only added when JS is active, so content never gets stuck invisible.
 */
export function ScrollReveal() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    document.documentElement.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not(.is-visible), [data-reveal-cascade]:not(.is-visible)",
      );
      nodes.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          requestAnimationFrame(() => el.classList.add("is-visible"));
        } else {
          io.observe(el);
        }
      });
    };

    // Safety net: after 1.2s force-reveal anything still hidden so content
    // is never stuck (e.g. if a container is inside a scrollable parent).
    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-cascade]")
        .forEach((el) => el.classList.add("is-visible"));
    }, 1500);

    const t = window.setTimeout(scan, 40);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
