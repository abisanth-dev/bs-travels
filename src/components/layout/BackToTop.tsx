"use client";

import { Icon } from "@/components/ui/Icon";

/** Returns to the top; jumps instead of scrolling for reduced-motion visitors. */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("#main, main")?.focus({ preventScroll: true });
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-ivory-dim transition hover:border-ivory hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.97]"
    >
      <Icon name="arrow-right" size={16} className="-rotate-90" /> Back to top
    </button>
  );
}
