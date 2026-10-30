"use client";

import Link from "next/link";
import { useCallback, useId } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { checklistNotice, checklists } from "@/content/checklists";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/** Checklists: tick items here and the folder in the scene fills up. */
export function PrepareSection() {
  const id = useId();
  const slug = useSceneState((s) => s.checklist.slug);
  const current = checklists.find((c) => c.slug === slug)!;
  const onProgress = useCallback((done: number, total: number) => sceneState.set({ checklist: { slug, done, total } }), [slug]);

  return (
    <section data-flight="prepare" aria-labelledby="prepare-title" className="relative isolate overflow-x-clip py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="eyebrow" data-reveal>
            Journey preparation
          </p>
          <h2 id="prepare-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]" data-reveal>
            Prepare with confidence.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ivory-dim">
            Choose a checklist and tick items off as you gather them. Print it and bring it to your consultation.
          </p>
          <SceneSlot name="folder" className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-line" posterClassName="object-cover" />
          <p className="mt-4 text-sm text-ivory-faint">{checklistNotice}</p>
        </div>

        <div>
          <label htmlFor={id} className="block text-sm text-ivory-dim">
            Checklist
          </label>
          <div className="relative mt-2">
            <select
              id={id}
              value={slug}
              onChange={(e) => sceneState.set({ checklist: { slug: e.target.value, done: 0, total: 0 } })}
              className="min-h-12 w-full appearance-none rounded-full border border-line-strong bg-navy-2 px-5 pr-12 text-ivory"
            >
              {checklists.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                  {c.variants.length ? "" : " (contact us)"}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-ivory-faint" />
          </div>

          <div className="mt-6">
            {current.variants.length ? (
              <div
                tabIndex={0}
                role="region"
                aria-label={`${current.title}, scrollable`}
                className="max-h-[70svh] overflow-y-auto rounded-[1.5rem] border border-line bg-night/60 p-4 sm:p-6"
              >
                <ChecklistView key={current.slug} checklist={current} onProgress={onProgress} printHref={`/checklists/${current.slug}`} compact />
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-line p-7">
                <p className="font-display text-2xl">{current.title}</p>
                <p className="mt-3 leading-relaxed text-ivory-dim">Contact us for the latest checklist. We will tell you what to prepare for your situation.</p>
                <Link href={`/enquire?service=visa-consultancy`} className={buttonClass("primary", "mt-6")}>
                  Ask for this checklist <Icon name="arrow-right" size={18} />
                </Link>
              </div>
            )}
          </div>
          <Link href={`/checklists/${current.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-ivory hover:text-gold">
            Open the full checklist page <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
