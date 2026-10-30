"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { checklists } from "@/content/checklists";
import { destinations, origin, regions, type Region } from "@/content/destinations";
import { distanceKm } from "@/lib/geo";
import { useStage } from "./HomeExperience";

export function GlobeSection() {
  const { globeSlot, slot, selected, setSelected, globeInput, globeLabels, ready, tier } = useStage();
  const passSlot = slot("globe");
  const live = ready && (tier === "low" || tier === "high");
  const last = useRef<{ x: number; y: number } | null>(null);
  const dest = destinations.find((d) => d.slug === selected) ?? null;
  const checklist = dest?.checklist ? checklists.find((c) => c.slug === dest.checklist) : undefined;
  const hasItems = Boolean(checklist && checklist.variants.length);
  const [filter, setFilter] = useState<Region | "all">("all");
  const usedRegions = regions.filter((r) => destinations.some((d) => d.region === r.id));
  const regionLabel = (id: Region) => regions.find((r) => r.id === id)?.label ?? "";
  const rows = useMemo(
    () =>
      destinations
        .filter((d) => filter === "all" || d.region === filter)
        .map((d) => ({ d, km: Math.round(distanceKm(origin, d.marker) / 100) * 100 }))
        .sort((a, b) => a.km - b.km),
    [filter],
  );

  const labelRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) globeLabels.current.set(key, el);
      else globeLabels.current.delete(key);
    },
    [globeLabels],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    last.current = { x: e.clientX, y: e.clientY };
    globeInput.current.dragging = true;
    globeInput.current.lastInteraction = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!globeInput.current.dragging || !last.current) return;
    globeInput.current.dx += e.clientX - last.current.x;
    globeInput.current.dy += e.clientY - last.current.y;
    globeInput.current.lastInteraction = performance.now();
    last.current = { x: e.clientX, y: e.clientY };
  };
  const endDrag = () => {
    globeInput.current.dragging = false;
    globeInput.current.lastInteraction = performance.now();
    last.current = null;
  };

  return (
    <section id="destinations-globe" data-flight="globe" aria-labelledby="globe-title" className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{ background: "radial-gradient(50% 55% at 32% 55%, rgb(23 38 69 / 0.9), rgb(10 19 38 / 0) 70%)" }}
      />
      <Container>
        <div className="grid gap-6 border-b border-line pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow" data-reveal>
              Where people ask us about
            </p>
            <h2 id="globe-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]" data-reveal>
              From Jaffna to your next destination.
            </h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-ivory-dim" data-reveal>
            Every journey we help with starts from our office in Jaffna. Choose a destination to see how we can help, and find
            its document checklist where we have one.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="lg:sticky lg:top-[10svh] lg:self-start">
            <div
              ref={(el) => {
                globeSlot.current = el;
                passSlot.current = el;
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="relative mx-auto aspect-square w-full max-w-[680px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
            >
              {/* Static globe for reduced motion, no WebGL, and while 3D loads. */}
              <Image
                src="/images/globe/static.png"
                alt="A globe with flight arcs from Jaffna, Sri Lanka, to the destinations listed beside it"
                fill
                sizes="(min-width: 1024px) 680px, 100vw"
                className={`object-contain transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}
              />
              {live ? (
                <div className="absolute inset-0" aria-hidden>
                  <span
                    ref={labelRef("origin")}
                    className="absolute left-0 top-0 whitespace-nowrap text-xs font-medium text-gold transition-opacity"
                  >
                    <span className="ml-3 inline-block -translate-y-1/2 rounded-full bg-night/80 px-2 py-0.5">Jaffna</span>
                  </span>
                  {destinations.map((d) => (
                    <button
                      key={d.slug}
                      ref={labelRef(d.slug)}
                      type="button"
                      tabIndex={-1}
                      onClick={() => setSelected(d.slug === selected ? null : d.slug)}
                      className="group absolute left-0 top-0 -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full transition-opacity"
                    >
                      <span
                        className={`pointer-events-none absolute left-7 whitespace-nowrap rounded-full bg-night/80 px-2 py-0.5 text-xs transition-opacity ${
                          d.slug === selected ? "text-gold opacity-100" : "text-ivory opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {d.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-center text-xs text-ivory-faint">
              {live ? "Drag to turn the globe. " : ""}Markers show enquiry destinations, not BS Travels offices.
            </p>
          </div>

          {/* Departures board: every route starts in Jaffna. */}
          <div className="overflow-hidden rounded-[1.75rem] border border-line-strong bg-night/70 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <p className="flex items-center gap-3 text-sm">
                <span className="relative flex h-2.5 w-2.5" aria-hidden>
                  <span className="absolute inset-0 animate-ping rounded-full bg-gold/60 motion-reduce:hidden" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-gold" />
                </span>
                <span className="whitespace-nowrap font-medium uppercase tracking-[0.14em] text-ivory sm:tracking-[0.2em]">Departing Jaffna</span>
              </p>
              <p className="whitespace-nowrap text-xs text-ivory-faint tabular-nums">{rows.length} {rows.length === 1 ? "destination" : "destinations"}</p>
            </div>

            <div role="group" aria-label="Filter by region" className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3 sm:px-6">
              {[{ id: "all" as const, label: "All" }, ...usedRegions].map((r) => {
                const on = filter === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilter(r.id)}
                    className={`min-h-9 shrink-0 rounded-full px-3.5 text-xs transition-colors ${
                      on ? "bg-ivory text-night" : "text-ivory-dim hover:bg-navy-3 hover:text-ivory"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <fieldset>
              <legend className="sr-only">Select a destination</legend>
              <div className="hidden grid-cols-[1fr_auto_5.5rem] gap-4 px-6 pt-4 text-[0.65rem] uppercase tracking-[0.2em] text-ivory-faint sm:grid" aria-hidden>
                <span>Destination</span>
                <span>Region</span>
                <span className="text-right">Distance</span>
              </div>
              <ul className="max-h-[26rem] overflow-y-auto px-2 py-2 sm:px-3 lg:max-h-[30rem]">
                {rows.map(({ d, km }) => {
                  const on = d.slug === selected;
                  return (
                    <li key={d.slug}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSelected(on ? null : d.slug)}
                        className={`group grid min-h-12 w-full grid-cols-[1fr_auto] items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors sm:grid-cols-[1fr_auto_5.5rem] sm:px-3 ${
                          on ? "bg-gold text-night" : "hover:bg-navy-2"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            name="arrow-right"
                            size={14}
                            className={`shrink-0 transition-transform ${on ? "text-night" : "text-gold group-hover:translate-x-0.5"}`}
                          />
                          <span className={`font-display text-xl leading-tight ${on ? "text-night" : "text-ivory"}`}>{d.name}</span>
                        </span>
                        <span className={`hidden text-xs sm:block ${on ? "text-night/75" : "text-ivory-faint"}`}>{regionLabel(d.region)}</span>
                        <span className={`text-right text-sm tabular-nums ${on ? "text-night" : "text-ivory-dim"}`}>
                          {km.toLocaleString("en-GB")} km
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            <div aria-live="polite" className="border-t border-line bg-navy-2/80 px-5 py-6 sm:px-6">
              {dest ? (
                <article>
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory-faint">
                    {dest.kind === "city" ? `City in ${dest.country}` : "Country"} · {dest.marker.place}
                    {dest.marker.placeKind === "capital" ? " (capital) shown on the globe" : ""}
                  </p>
                  <h3 className="font-display mt-2 text-3xl">{dest.name}</h3>
                  <p className="mt-3 leading-relaxed text-ivory-dim">{dest.intro}</p>
                  <p className="mt-3 text-xs text-ivory-faint">Distances are approximate, measured from Jaffna as the crow flies.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/enquire?destination=${dest.slug}`} className={buttonClass("primary")}>
                      Enquire About This Destination <Icon name="arrow-right" size={18} />
                    </Link>
                    {checklist ? (
                      <Link href={`/checklists/${checklist.slug}`} className={buttonClass("secondary")}>
                        <Icon name="document" size={18} />
                        {hasItems ? "Open document checklist" : "Ask for the latest checklist"}
                      </Link>
                    ) : null}
                    <Link href={`/destinations/${dest.slug}`} className={buttonClass("ghost")}>
                      Read the destination guide
                    </Link>
                  </div>
                </article>
              ) : (
                <p className="text-sm text-ivory-faint">
                  Select a destination on the board or the globe to see enquiry and checklist options.
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
