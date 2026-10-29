"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { serviceCategories, services, type ServiceCategory } from "@/content/services";

export function ServiceFilter() {
  const [cat, setCat] = useState<ServiceCategory | "all">("all");
  const list = services.filter((s) => cat === "all" || s.category === cat);
  return (
    <div>
      <div role="group" aria-label="Filter services" className="flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All services" }, ...serviceCategories].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`min-h-11 rounded-full border px-5 text-sm transition-colors ${
              cat === c.id ? "border-gold bg-gold text-night" : "border-line-strong text-ivory-dim hover:text-ivory"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {list.length} {list.length === 1 ? "service" : "services"}
      </p>
      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {list.map((s, i) => (
          <li key={s.slug} className={i === 0 && cat === "all" ? "md:col-span-2" : ""}>
            <Link
              href={`/services/${s.slug}`}
              className="group flex h-full flex-col gap-6 rounded-[1.75rem] border border-line bg-navy-2/70 p-7 transition-colors hover:border-line-strong sm:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong text-gold">
                  <Icon name={s.icon} size={26} />
                </span>
                <Icon name="arrow-up-right" size={22} className="text-ivory-faint group-hover:text-gold" />
              </div>
              <div>
                <h2 className="font-display text-3xl">{s.name}</h2>
                <p className="mt-3 max-w-xl leading-relaxed text-ivory-dim">{s.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
