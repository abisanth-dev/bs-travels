"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { services } from "@/content/services";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/** Services: tabs choose which travel object the scene brings into focus. */
export function ServicesSection() {
  const uid = useId();
  const active = useSceneState((s) => s.service);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = services.find((s) => s.slug === active) ?? services[0];

  const select = (i: number, focus = false) => {
    const s = services[(i + services.length) % services.length];
    sceneState.set({ service: s.slug });
    if (focus) tabs.current[(i + services.length) % services.length]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: services.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  return (
    <section id="services" data-flight="services" aria-labelledby="services-title" className="relative isolate scroll-mt-20 overflow-hidden py-24 sm:py-32 lg:min-h-[100svh]">
      <SceneSlot name="services" className="relative mx-auto aspect-square w-full max-w-xl lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto lg:max-w-none" posterClassName="object-cover object-[70%_50%]" />
      <Container className="relative">
        <div className="max-w-xl" data-reveal>
          <p className="eyebrow">What we do · Prepare for your journey</p>
          <h2 id="services-title" className="font-display mt-5 text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02]">
            Every detail.
            <br />
            <span className="text-ivory-dim">One trusted team.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ivory-dim">
            BS Travels brings the practical side of travel under one roof in Jaffna, so you can plan a visit, a move or a holiday with
            the same people from the first question to the day you fly.
          </p>
        </div>

        <div className="mt-10 grid max-w-xl gap-8 sm:grid-cols-[minmax(0,14rem)_1fr] lg:max-w-2xl">
          <div role="tablist" aria-orientation="vertical" aria-label="Our services" className="flex flex-col gap-1">
            {services.map((s, i) => {
              const on = s.slug === current.slug;
              return (
                <button
                  key={s.slug}
                  ref={(el) => void (tabs.current[i] = el)}
                  role="tab"
                  id={`${uid}-tab-${s.slug}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-left text-[0.95rem] transition-colors ${
                    on ? "bg-ivory text-night" : "text-ivory-dim hover:bg-white/5 hover:text-ivory"
                  }`}
                >
                  <Icon name={s.icon} size={18} className={on ? "text-gold-deep" : "text-ivory-faint"} />
                  {s.name}
                </button>
              );
            })}
          </div>
          <div
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${current.slug}`}
            className="rounded-[1.5rem] border border-line bg-night/70 p-6 backdrop-blur-sm sm:p-7"
          >
            <p className="font-display text-sm text-gold">0{services.indexOf(current) + 1}</p>
            <h3 className="font-display mt-2 text-3xl leading-tight">{current.name}</h3>
            <p className="mt-3 leading-relaxed text-ivory-dim">{current.summary}</p>
            <ul className="mt-5 space-y-2 text-sm text-ivory-dim">
              {current.helpsWith.slice(0, 3).map((h) => (
                <li key={h} className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" /> {h}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/services/${current.slug}`} className={buttonClass("primary")}>
                About {current.name.toLowerCase()} <Icon name="arrow-right" size={18} />
              </Link>
              <Link href={`/enquire?service=${current.slug}`} className={buttonClass("ghost")}>
                Enquire
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
