"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { checklists } from "@/content/checklists";
import { destinations, origin, regions } from "@/content/destinations";
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
    <section id="destinations-globe" data-flight="globe" aria-labelledby="globe-title" className="relative overflow-hidden py-28 sm:py-36">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{ background: "radial-gradient(55% 60% at 70% 50%, rgb(23 38 69 / 0.9), rgb(10 19 38 / 0) 70%)" }}
      />
      <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 lg:order-1">
          <p className="eyebrow" data-reveal>
            Where people ask us about
          </p>
          <h2 id="globe-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]" data-reveal>
            From Jaffna to your next destination.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory-dim" data-reveal>
            Every journey we help with starts from our office in Jaffna. Choose a destination to see how we can help, and find
            its document checklist where we have one.
          </p>

          <fieldset className="mt-10">
            <legend className="text-sm text-ivory-faint">Select a destination</legend>
            <div className="mt-4 space-y-5">
              {regions
                .filter((r) => destinations.some((d) => d.region === r.id))
                .map((r) => (
                  <div key={r.id}>
                    <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ivory-faint">{r.label}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {destinations
                        .filter((d) => d.region === r.id)
                        .map((d) => {
                          const on = d.slug === selected;
                          return (
                            <li key={d.slug}>
                              <button
                                type="button"
                                aria-pressed={on}
                                onClick={() => setSelected(on ? null : d.slug)}
                                className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${
                                  on
                                    ? "border-gold bg-gold text-night"
                                    : "border-line-strong text-ivory-dim hover:border-ivory hover:text-ivory"
                                }`}
                              >
                                {d.name}
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
            </div>
          </fieldset>
        </div>

        <div className="order-1 lg:order-2">
          <div
            ref={(el) => {
              globeSlot.current = el;
              passSlot.current = el;
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative mx-auto aspect-square w-full max-w-[640px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          >
            {/* Static globe for reduced motion, no WebGL, and while 3D loads. */}
            <Image
              src="/images/globe/static.png"
              alt="A globe with flight arcs from Jaffna, Sri Lanka, to the destinations listed beside it"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
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
      </Container>

      <Container>
        <div aria-live="polite" className="mt-12 min-h-[1px]">
          {dest ? (
            <article className="grid gap-8 rounded-[1.75rem] border border-line-strong bg-navy-2/90 p-7 sm:p-9 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory-faint">
                  {dest.kind === "city" ? `City in ${dest.country}` : "Country"} · {dest.marker.place}
                  {dest.marker.placeKind === "capital" ? " (capital) shown on the globe" : ""}
                </p>
                <h3 className="font-display mt-3 text-4xl">{dest.name}</h3>
                <p className="mt-4 max-w-xl leading-relaxed text-ivory-dim">{dest.intro}</p>
                <p className="mt-4 text-sm text-ivory-faint">
                  About {Math.round(distanceKm(origin, dest.marker) / 100) * 100} km from Jaffna as the crow flies.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-stretch lg:justify-center">
                <Link href={`/enquire?destination=${dest.slug}`} className={buttonClass("primary")}>
                  Enquire About This Destination <Icon name="arrow-right" size={18} />
                </Link>
                {checklist ? (
                  <Link href={`/checklists/${checklist.slug}`} className={buttonClass("secondary")}>
                    <Icon name="document" size={18} />
                    {hasItems ? "Open document checklist" : "Ask for the latest checklist"}
                  </Link>
                ) : null}
                <Link href={`/destinations/${dest.slug}`} className={buttonClass("ghost", "justify-start lg:justify-center")}>
                  Read the destination guide
                </Link>
              </div>
            </article>
          ) : (
            <p className="text-sm text-ivory-faint">Select a destination above to see enquiry and checklist options.</p>
          )}
        </div>
      </Container>
    </section>
  );
}
