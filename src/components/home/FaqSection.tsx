"use client";

import Link from "next/link";
import { useId } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { faqs } from "@/content/faqs";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

const PICKS = ["services", "how-to-start", "visa-consultancy", "visa-timing", "air-ticketing", "translation"];

/** FAQ: a disclosure list whose panels open with a smooth height change. */
export function FaqSection() {
  const base = useId();
  const open = useSceneState((s) => s.faq);
  const items = PICKS.map((id) => faqs.find((f) => f.id === id)).filter((f) => f !== undefined);
  return (
    <section data-flight="faq" aria-labelledby="faq-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="eyebrow" data-reveal>
            FAQ
          </p>
          <h2 id="faq-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.03]" data-reveal>
            Clear answers before you travel.
          </h2>
          <SceneSlot name="faq" className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[2rem]" posterClassName="object-cover" />
        </div>
        <div>
          <div className="divide-y divide-line border-y border-line">
            {items.map((f) => {
              const isOpen = open === f.id;
              const btn = `${base}-${f.id}-btn`;
              const panel = `${base}-${f.id}-panel`;
              return (
                <div key={f.id}>
                  <h3 className="m-0">
                    <button
                      id={btn}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      onClick={() => sceneState.set({ faq: isOpen ? null : f.id })}
                      className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-xl text-ivory hover:text-gold sm:text-2xl"
                    >
                      {f.question}
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong transition-transform duration-300 ${isOpen ? "rotate-180 border-gold text-gold" : ""}`}
                        aria-hidden
                      >
                        <Icon name="chevron-down" size={18} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panel}
                    role="region"
                    aria-labelledby={btn}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows] duration-500 ease-out-soft motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-12 text-lg leading-relaxed text-ivory-dim">{f.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/faq" className="mt-6 inline-flex min-h-11 items-center gap-2 text-ivory hover:text-gold">
            All questions <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
