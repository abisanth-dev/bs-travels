import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { courseRequirementsNote, courses } from "@/content/courses";

export function CoursesSection() {
  return (
    <section data-flight="courses" aria-labelledby="courses-title" className="relative border-t border-line bg-night py-28 sm:py-36">
      <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal>
          <p className="eyebrow">Language courses</p>
          <h2 id="courses-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4rem)] leading-[1.05]">
            Speak the language of where you are going.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ivory-dim">{courseRequirementsNote}</p>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {courses.map((c) => (
            <li key={c.slug} data-reveal>
              <div className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <span className="font-display text-5xl font-light text-gold/80" aria-hidden>
                  {c.short}
                </span>
                <div>
                  <h3 className="font-display text-2xl">
                    <Link href={`/courses/${c.slug}`} className="hover:text-gold">
                      {c.name}
                    </Link>
                  </h3>
                  <p className="mt-2 max-w-lg text-ivory-dim">{c.summary}</p>
                </div>
                <Link
                  href={`/enquire?service=language-course&course=${c.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-full border border-line-strong px-5 text-sm hover:border-ivory sm:justify-self-end"
                >
                  Course enquiry <Icon name="arrow-right" size={16} />
                  <span className="sr-only">for {c.name}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
