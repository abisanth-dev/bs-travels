"use client";

import { useId, useState } from "react";
import { Icon } from "./Icon";

export type AccordionItem = { id: string; title: string; body: React.ReactNode };

/** Disclosure-pattern accordion: each header is a button controlling its panel. */
export function Accordion({ items, headingLevel = 3 }: { items: AccordionItem[]; headingLevel?: 2 | 3 | 4 }) {
  const base = useId();
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btn = `${base}-${item.id}-btn`;
        const panel = `${base}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <H className="m-0">
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
                className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-xl text-ivory hover:text-gold sm:text-2xl"
              >
                {item.title}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong transition-transform duration-300 ${
                    isOpen ? "rotate-180 border-gold text-gold" : ""
                  }`}
                  aria-hidden
                >
                  <Icon name="chevron-down" size={18} />
                </span>
              </button>
            </H>
            <div id={panel} role="region" aria-labelledby={btn} hidden={!isOpen} className="pb-6 pr-12 text-lg leading-relaxed text-ivory-dim">
              {item.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
