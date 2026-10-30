"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { checklists } from "@/content/checklists";
import { destinations, regions, type Destination } from "@/content/destinations";
import { JOURNEY_VIDEOS } from "@/content/journeyVideos";
import { useStage } from "./HomeExperience";
import { JOURNEY } from "./homeData";
import { sceneState, useSceneState } from "./sceneState";

const LAST = JOURNEY.length - 1;
/** Scroll distance per stop, in viewport heights. */
const STEP_VH = 85;
const pad = (n: number) => String(n).padStart(2, "0");
const regionLabel = (d: Destination) => regions.find((r) => r.id === d.region)?.label ?? "";
const destOf = (slug: string) => destinations.find((d) => d.slug === slug);
const HAS_VIDEO = Object.keys(JOURNEY_VIDEOS).length > 0;
const NOTE = HAS_VIDEO
  ? "Videos are AI-generated and landmarks are illustrations of each destination, not BS Travels offices."
  : "Landmarks are illustrations of each destination, not BS Travels offices.";

/**
 * Full-bleed clips over the 3D stage for stops that have one. Only the
 * current stop and its neighbours are loaded; the current one plays.
 */
function VideoLayer({ index }: { index: number }) {
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  const near = JOURNEY.filter((_, i) => Math.abs(i - index) <= 1 && JOURNEY_VIDEOS[JOURNEY[i].slug]);
  const current = JOURNEY[index].slug;
  useEffect(() => {
    Object.entries(refs.current).forEach(([slug, v]) => {
      if (!v) return;
      if (slug === current) v.play().catch(() => {});
      else v.pause();
    });
  }, [current, near.length]);
  return (
    <>
      {near.map(({ slug }) => {
        const clip = JOURNEY_VIDEOS[slug];
        return (
          <video
            key={slug}
            ref={(el) => void (refs.current[slug] = el)}
            src={clip.src}
            poster={clip.poster}
            muted
            loop
            playsInline
            preload={slug === current ? "auto" : "metadata"}
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${slug === current ? "opacity-100" : "opacity-0"}`}
          />
        );
      })}
    </>
  );
}

function DestinationLinks({ dest, compact = false }: { dest: Destination; compact?: boolean }) {
  const checklist = dest.checklist ? checklists.find((c) => c.slug === dest.checklist) : undefined;
  const hasItems = Boolean(checklist && checklist.variants.length);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-5 sm:gap-x-5 sm:gap-y-3">
      <Link href={`/enquire?destination=${dest.slug}`} className={buttonClass("primary", compact ? "min-h-11 px-4 text-sm sm:px-5" : "")}>
        Enquire About This Destination <Icon name="arrow-right" size={18} />
      </Link>
      {checklist ? (
        <Link href={`/checklists/${checklist.slug}`} className={buttonClass("secondary", compact ? "min-h-11 px-4 text-sm sm:px-5" : "")}>
          <Icon name="document" size={18} />
          {hasItems ? "Document checklist" : "Ask for the latest checklist"}
        </Link>
      ) : null}
      <Link href={`/destinations/${dest.slug}`} className={buttonClass("ghost", compact ? "min-h-0 text-sm max-sm:hidden" : "min-h-0 text-sm")}>
        Read the destination guide
      </Link>
    </div>
  );
}

/** The card for the stop the camera is at. */
function StopCard({ index }: { index: number }) {
  const { slug, km } = JOURNEY[index];
  const dest = destOf(slug);
  return (
    <article key={slug} className="journey-in rounded-[1.5rem] border border-line-strong bg-night/80 p-5 backdrop-blur-md sm:p-7">
      {dest ? (
        <>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">
            Stop {pad(index)} of {pad(LAST)} · {regionLabel(dest)}
          </p>
          <h3 className="font-display mt-2 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02]">{dest.name}</h3>
          {JOURNEY_VIDEOS[slug] ? <p className="sr-only">Shown with an AI-generated video of {dest.name}.</p> : null}
          <p className="mt-2 text-xs text-ivory-faint">
            {dest.kind === "city" ? `City in ${dest.country}` : dest.country} · about {km.toLocaleString("en-GB")} km from Jaffna
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ivory-dim sm:line-clamp-none sm:text-base">{dest.intro}</p>
          <DestinationLinks dest={dest} compact />
        </>
      ) : (
        <>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">Starting point</p>
          <h3 className="font-display mt-2 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02]">Jaffna, Sri Lanka</h3>
          <p className="mt-3 text-sm leading-relaxed text-ivory-dim sm:text-base">
            Every journey we help with starts from our office in Jaffna. Keep scrolling to fly to each destination people ask us
            about, from the nearest to the farthest.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-ivory-faint">
            <Icon name="arrow-right" size={16} className="rotate-90 text-gold" /> Scroll to take off
          </p>
        </>
      )}
    </article>
  );
}

export function JourneySection() {
  const { slot, tier } = useStage();
  const passSlot = slot("journey");
  const track = useRef<HTMLDivElement>(null);
  const index = useSceneState((s) => Math.round(s.journey));
  const still = tier === "static";

  // Scroll through the track drives the journey, 0 (Jaffna) to LAST.
  useEffect(() => {
    if (still) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const j = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) * LAST : 0;
      if (Math.abs(j - sceneState.get().journey) > 0.0005) sceneState.set({ journey: j });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [still]);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + r.top + (i / LAST) * total + 2 });
  };

  return (
    <section id="destinations-globe" data-flight="globe" aria-labelledby="globe-title" className="relative pt-24 sm:pt-32">
      <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
        <div>
          <p className="eyebrow" data-reveal>
            Where people ask us about
          </p>
          <h2 id="globe-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]" data-reveal>
            From Jaffna to your next destination.
          </h2>
        </div>
        <div data-reveal>
          <p className="max-w-lg text-lg leading-relaxed text-ivory-dim">
            Every journey we help with starts from our office in Jaffna. {still ? "Choose" : "Scroll to fly to"} a destination
            to see how we can help, and find its document checklist where we have one.
          </p>
          {still ? null : (
            <a href="#destinations-end" className="mt-4 inline-block text-sm text-ivory-faint underline-offset-4 hover:text-gold hover:underline">
              Skip the destination journey
            </a>
          )}
        </div>
      </Container>

      {still ? (
        <Container className="pb-24 sm:pb-32">
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JOURNEY.slice(1).map(({ slug, km }) => {
              const d = destOf(slug)!;
              return (
                <li key={slug} className="overflow-hidden rounded-[1.5rem] border border-line bg-navy-2/70 p-6">
                  {JOURNEY_VIDEOS[slug] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={JOURNEY_VIDEOS[slug].poster} alt="" loading="lazy" className="-mx-6 -mt-6 mb-5 aspect-video w-[calc(100%+3rem)] max-w-none object-cover" />
                  ) : null}
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ivory-faint">
                    {regionLabel(d)} · about {km.toLocaleString("en-GB")} km from Jaffna
                  </p>
                  <h3 className="font-display mt-2 text-3xl">{d.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{d.intro}</p>
                  <DestinationLinks dest={d} compact />
                </li>
              );
            })}
          </ul>
        </Container>
      ) : (
        <div ref={track} className="relative mt-10" style={{ height: `calc(${LAST * STEP_VH}svh + 100svh)` }}>
          <div className="sticky top-0 h-svh overflow-hidden">
            <div ref={(el) => void (passSlot.current = el)} className="absolute inset-0" />
            {HAS_VIDEO ? <VideoLayer index={index} /> : null}
            <div
              className="pointer-events-none absolute inset-0 hidden lg:block"
              aria-hidden
              style={{ background: "linear-gradient(90deg, rgb(10 19 38 / 0.85), rgb(10 19 38 / 0) 45%)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 lg:hidden"
              aria-hidden
              style={{ background: "linear-gradient(0deg, rgb(10 19 38 / 0.9), rgb(10 19 38 / 0) 55%)" }}
            />

            {/* Phones: progress along the top. */}
            <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+5rem)] px-4 lg:hidden">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous destination" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-night/60 disabled:opacity-40">
                  <Icon name="arrow-right" size={16} className="rotate-180" />
                </button>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ivory/15">
                  <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${(index / LAST) * 100}%` }} />
                </div>
                <button type="button" onClick={() => goTo(Math.min(LAST, index + 1))} disabled={index === LAST} aria-label="Next destination" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-night/60 disabled:opacity-40">
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>

            <Container className="relative flex h-full flex-col justify-end pb-6 lg:flex-row lg:items-center lg:justify-between lg:pb-0">
              <div aria-live="polite" className="w-full max-w-md lg:max-w-[30rem]">
                <StopCard key={index} index={index} />
                <p className="mt-3 text-xs text-ivory-faint">{NOTE}</p>
              </div>

              {/* Desktop: every stop, as a route map you can jump along. */}
              <nav aria-label="Destination journey" className="hidden rounded-[1.5rem] border border-line bg-night/60 py-4 pl-6 pr-8 backdrop-blur-md lg:block">
                <ol className="relative border-r border-line pr-5 text-right">
                  {JOURNEY.map(({ slug }, i) => {
                    const on = i === index;
                    const name = destOf(slug)?.name ?? "Jaffna";
                    return (
                      <li key={slug}>
                        <button
                          type="button"
                          aria-current={on ? "step" : undefined}
                          onClick={() => goTo(i)}
                          className={`group relative flex w-full items-center justify-end gap-3 py-[0.28rem] text-sm transition-colors ${
                            on ? "text-gold" : i < index ? "text-ivory-dim hover:text-ivory" : "text-ivory-faint hover:text-ivory"
                          }`}
                        >
                          {name}
                          <span
                            aria-hidden
                            className={`absolute -right-[1.62rem] h-2.5 w-2.5 rounded-full border transition-all ${
                              on ? "scale-125 border-gold bg-gold" : i < index ? "border-gold/70 bg-gold/40" : "border-line-strong bg-navy"
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </Container>
          </div>
        </div>
      )}
      <div id="destinations-end" tabIndex={-1} className="outline-none" />
    </section>
  );
}
