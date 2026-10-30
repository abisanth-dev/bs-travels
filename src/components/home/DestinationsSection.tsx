"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { getDestination, type Destination } from "@/content/destinations";
import { INSPIRATION } from "./homeData";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

const list = INSPIRATION.map(getDestination).filter((d): d is Destination => Boolean(d));

/** Destination inspiration: one cinematic composition at a time. */
export function DestinationsSection() {
  const uid = useId();
  const index = useSceneState((s) => s.inspiration);
  const d = list[index] ?? list[0];
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const go = (next: number, dir: 1 | -1) => sceneState.set({ inspiration: (next + list.length) % list.length, inspirationDir: dir });

  return (
    <section
      data-flight="explore"
      aria-labelledby="explore-title"
      className="relative isolate min-h-[100svh] touch-pan-y overflow-hidden"
      // Horizontal swipes over the scene change destination; vertical scrolling is untouched.
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a,button,select,article")) return;
        swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }}
    >
      <SceneSlot name="inspire" className="absolute inset-0 -z-10" posterClassName="object-cover" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-night/70" aria-hidden />
      <Container className="relative flex min-h-[100svh] flex-col justify-between py-24 sm:py-28">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Step into the destination</p>
          <h2 id="explore-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]">
            Places worth the journey.
          </h2>
        </div>

        <div className="mt-[28vh] grid gap-8 lg:mt-0 lg:grid-cols-[1fr_auto] lg:items-end">
          <article aria-live="polite" aria-atomic className="max-w-xl rounded-[1.5rem] border border-line bg-night/70 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
              {d.kind === "city" ? `City · ${d.country}` : "Country"} · {String(index + 1).padStart(2, "0")} of {list.length}
            </p>
            <h3 className="font-display mt-2 text-5xl leading-tight sm:text-6xl">{d.name}</h3>
            <p className="mt-3 text-lg text-ivory-dim">{d.headline}</p>
            <p className="mt-2 text-sm text-ivory-faint">Ideas include {d.highlights.join(", ")}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/enquire?destination=${d.slug}`} className={buttonClass("primary")}>
                Enquire About This Destination <Icon name="arrow-right" size={18} />
              </Link>
              <Link href={`/destinations/${d.slug}`} className={buttonClass("ghost")}>
                Destination guide
              </Link>
            </div>
          </article>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex gap-3">
              <button type="button" onClick={() => go(index - 1, -1)} className={buttonClass("secondary", "!px-0 w-12")} aria-label="Previous destination">
                <Icon name="arrow-right" size={18} className="rotate-180" />
              </button>
              <button type="button" onClick={() => go(index + 1, 1)} className={buttonClass("secondary", "!px-0 w-12")} aria-label="Next destination">
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
            <div>
              <label htmlFor={`${uid}-pick`} className="sr-only">
                Choose a destination
              </label>
              <select
                id={`${uid}-pick`}
                value={d.slug}
                onChange={(e) => {
                  const next = list.findIndex((x) => x.slug === e.target.value);
                  go(next, next >= index ? 1 : -1);
                }}
                className="min-h-11 rounded-full border border-line-strong bg-night/80 px-5 text-sm text-ivory"
              >
                {list.map((x) => (
                  <option key={x.slug} value={x.slug}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="max-w-xs text-xs text-ivory-faint lg:text-right">Artwork is generated illustration. These are ideas to start a conversation, not packages.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
