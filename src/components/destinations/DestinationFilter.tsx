"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { checklists } from "@/content/checklists";
import { destinations, regions, type Region } from "@/content/destinations";

export function DestinationFilter() {
  const [region, setRegion] = useState<Region | "all">("all");
  const [withChecklist, setWithChecklist] = useState(false);
  const hasItems = (slug?: string) => Boolean(slug && checklists.find((c) => c.slug === slug)?.variants.length);
  const list = destinations.filter((d) => (region === "all" || d.region === region) && (!withChecklist || hasItems(d.checklist)));
  const used = regions.filter((r) => destinations.some((d) => d.region === r.id));
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by region" className="flex flex-wrap gap-2">
          {[{ id: "all" as const, label: "All regions" }, ...used].map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={region === r.id}
              onClick={() => setRegion(r.id)}
              className={`min-h-11 rounded-full border px-4 text-sm ${
                region === r.id ? "border-gold bg-gold text-night" : "border-line-strong text-ivory-dim hover:text-ivory"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ivory-dim">
          <input type="checkbox" checked={withChecklist} onChange={(e) => setWithChecklist(e.target.checked)} className="h-5 w-5 accent-[var(--color-gold)]" />
          Only show destinations with a document checklist
        </label>
      </div>
      <p className="mt-6 text-sm text-ivory-faint" aria-live="polite">
        Showing {list.length} of {destinations.length} destinations
      </p>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <li key={d.slug}>
            <article className="group relative isolate flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-line">
              <Image
                src={d.image?.src ?? `/images/destinations/${d.slug}.jpg`}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover transition-transform duration-[1400ms] ease-out-soft group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/50 to-transparent" aria-hidden />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                  {d.kind === "city" ? `City · ${d.country}` : regions.find((r) => r.id === d.region)?.label}
                </p>
                <h2 className="font-display mt-2 text-3xl">
                  <Link href={`/destinations/${d.slug}`} className="after:absolute after:inset-0">
                    {d.name}
                  </Link>
                </h2>
                <p className="mt-2 text-ivory-dim">{d.headline}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-ivory">
                  Destination guide <Icon name="arrow-right" size={16} />
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {list.length === 0 ? <p className="mt-6 text-ivory-dim">No destinations match these filters.</p> : null}
    </div>
  );
}
