import Link from "next/link";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { courseRequirementsNote, courses } from "@/content/courses";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Language Courses",
  description: "Spanish, Dutch, French and IELTS courses at BS Travels in Jaffna, for people planning to study, work or settle abroad.",
  path: "/courses",
});

export default function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="Language courses"
        title={
          <>
            Spanish, Dutch, French <span className="text-ivory-dim">and IELTS.</span>
          </>
        }
        lead={courseRequirementsNote}
        crumbs={[{ href: "/courses", label: "Courses" }]}
      />
      <Container className="pb-24">
        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((c) => (
            <li key={c.slug} className="flex flex-col rounded-[1.75rem] border border-line bg-navy-2/70 p-8 sm:p-10">
              <span className="font-display text-7xl font-light text-gold/70" aria-hidden>
                {c.short}
              </span>
              <h2 className="font-display mt-6 text-3xl">{c.name}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-ivory-dim">{c.summary}</p>
              <p className="mt-4 text-sm text-ivory-faint">Used in: {c.usedIn.join(", ")}</p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <Link href={`/enquire?service=language-course&course=${c.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory px-5 text-sm font-medium text-night hover:bg-gold">
                  Course enquiry <span className="sr-only">for {c.name}</span>
                </Link>
                <Link href={`/courses/${c.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-gold">
                  About the {c.name} course <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand title="Not sure which course you need?" body="Tell us where you plan to go and why. We will help you understand which language or test is relevant." enquireHref="/enquire?service=language-course" />
    </>
  );
}
