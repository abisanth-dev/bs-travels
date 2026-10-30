"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { GUIDES } from "./homeData";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/**
 * Travel journal. Only reviewed material is shown: the archived 2023 articles
 * stay off the homepage until they have been checked, so the cards point to
 * the site's maintained guides.
 */
export function JournalSection() {
  const focus = useSceneState((s) => s.journal);
  const set = (i: number | null) => sceneState.set({ journal: i });
  return (
    <section data-flight="journal" aria-labelledby="journal-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow" data-reveal>
            Travel journal
          </p>
          <h2 id="journal-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.03]" data-reveal>
            Discover useful guidance.
          </h2>
          <ul className="mt-8 divide-y divide-line border-y border-line" onMouseLeave={() => set(null)}>
            {GUIDES.map((g, i) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  onMouseEnter={() => set(i)}
                  onFocus={() => set(i)}
                  onBlur={() => set(null)}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-4 py-5 transition-colors ${focus === i ? "text-gold" : ""}`}
                >
                  <span>
                    <span className="text-xs uppercase tracking-[0.2em] text-ivory-faint">{g.kicker}</span>
                    <span className="font-display mt-1 block text-2xl">{g.title}</span>
                    <span className="mt-1 block text-ivory-dim">{g.body}</span>
                  </span>
                  <Icon name="arrow-up-right" size={20} className="text-ivory-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-gold" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ivory-faint">New travel articles will appear here once they have been reviewed.</p>
        </div>
        <SceneSlot name="journal" className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]" posterClassName="object-cover" />
      </Container>
    </section>
  );
}
