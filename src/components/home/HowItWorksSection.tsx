"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

const STAGES = [
  {
    title: "Tell us your plans",
    body: "Call, message us on WhatsApp, send an enquiry, or visit our office on Navalar Road in Jaffna. Tell us where you want to go and why.",
  },
  {
    title: "Receive personalised guidance",
    body: "We listen to what you need, ask about your documents and timing, explain the steps involved and give you a quote before any work begins.",
  },
  {
    title: "Prepare documents and arrangements",
    body: "We help you organise and check your documents, arrange flights where you need them, and keep in touch as things progress.",
  },
  {
    title: "Get ready for your journey",
    body: "With your paperwork in order you are ready for the next step. Visa decisions are made by the relevant authorities, so we never promise an outcome.",
  },
];

/** How it works: four stages; scrolling or selecting a stage moves the aircraft. */
export function HowItWorksSection() {
  const step = useSceneState((s) => s.step);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // The stage nearest the middle of the screen becomes active as you scroll.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) sceneState.set({ step: Number((e.target as HTMLElement).dataset.step) });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section data-flight="steps" aria-labelledby="steps-title" className="relative isolate py-24 sm:py-32">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="contents lg:block">
          <div className="order-1 max-w-xl" data-reveal>
            <p className="eyebrow">How it works</p>
            <h2 id="steps-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.03]">
              From enquiry to preparation.
            </h2>
          </div>
          <ol className="order-3 lg:mt-4">
            {STAGES.map((s, i) => {
              const on = i === step;
              return (
                <li key={s.title} ref={(el) => void (items.current[i] = el)} data-step={i} className="flex items-center py-2 lg:min-h-[52svh] lg:py-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => sceneState.set({ step: i })}
                    className={`w-full rounded-[1.5rem] border p-6 text-left transition-colors sm:p-7 ${
                      on ? "border-gold/70 bg-navy-2" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span className="font-display text-sm text-gold">Stage {i + 1}</span>
                    <span className="font-display mt-2 block text-3xl leading-tight text-ivory">{s.title}</span>
                    <span className="mt-3 block leading-relaxed text-ivory-dim">{s.body}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="contents lg:block">
          <div className="order-2 lg:sticky lg:top-[12svh]">
            <SceneSlot name="steps" className="relative h-[36svh] w-full overflow-hidden rounded-[1.75rem] border border-line sm:h-[44svh] lg:h-[76svh]" posterClassName="object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}
