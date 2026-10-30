"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { courseRequirementsNote, courses } from "@/content/courses";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/** Language courses: the selector turns the book's pages and swaps the panel. */
export function CoursesSection() {
  const uid = useId();
  const active = useSceneState((s) => s.course);
  const c = courses.find((x) => x.slug === active) ?? courses[0];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number, focus = false) => {
    const n = (i + courses.length) % courses.length;
    sceneState.set({ course: courses[n].slug });
    if (focus) tabs.current[n]?.focus();
  };

  return (
    <section data-flight="courses" aria-labelledby="courses-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <SceneSlot name="book" className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] lg:aspect-[5/4]" posterClassName="object-cover" />
        <div>
          <p className="eyebrow" data-reveal>
            Language courses
          </p>
          <h2 id="courses-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4rem)] leading-[1.05]" data-reveal>
            Open new possibilities.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ivory-dim">{courseRequirementsNote}</p>
          <div role="tablist" aria-label="Courses" className="mt-8 flex flex-wrap gap-2">
            {courses.map((x, i) => {
              const on = x.slug === c.slug;
              return (
                <button
                  key={x.slug}
                  ref={(el) => void (tabs.current[i] = el)}
                  role="tab"
                  id={`${uid}-${x.slug}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") select(i + 1, true);
                    if (e.key === "ArrowLeft") select(i - 1, true);
                  }}
                  className={`min-h-11 rounded-full border px-5 text-sm transition-colors ${on ? "border-gold bg-gold text-night" : "border-line-strong text-ivory-dim hover:text-ivory"}`}
                >
                  {x.name}
                </button>
              );
            })}
          </div>
          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${c.slug}`} className="mt-6 rounded-[1.5rem] border border-line p-6 sm:p-7">
            <h3 className="font-display text-3xl">{c.name}</h3>
            <p className="mt-3 leading-relaxed text-ivory-dim">{c.body[0]}</p>
            <p className="mt-3 text-sm text-ivory-faint">Used in: {c.usedIn.join(", ")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/enquire?service=language-course&course=${c.slug}`} className={buttonClass("primary")}>
                Course enquiry <Icon name="arrow-right" size={18} />
                <span className="sr-only">for {c.name}</span>
              </Link>
              <Link href={`/courses/${c.slug}`} className={buttonClass("ghost")}>
                About {c.name}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
