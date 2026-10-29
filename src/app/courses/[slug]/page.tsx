import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { courseRequirementsNote, courses, getCourse } from "@/content/courses";
import { getDestination } from "@/content/destinations";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c) return {};
  return pageMetadata({ title: `${c.name} Course`, description: `${c.summary} Enquire at BS Travels, Jaffna.`, path: `/courses/${c.slug}` });
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c) notFound();
  const dests = c.destinations.map(getDestination).filter((d) => d !== undefined);
  return (
    <>
      <PageHero
        eyebrow="Language course"
        title={c.name}
        lead={c.summary}
        crumbs={[
          { href: "/courses", label: "Courses" },
          { href: `/courses/${c.slug}`, label: c.name },
        ]}
      >
        <div className="mt-8">
          <LinkButton href={`/enquire?service=language-course&course=${c.slug}`} icon="arrow-right">
            Enquire about this course
          </LinkButton>
        </div>
      </PageHero>
      <Container className="grid gap-16 pb-24 lg:grid-cols-[1.3fr_1fr]">
        <div className="prose-bst max-w-2xl text-lg">
          {c.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <h2>Before you enrol</h2>
          <p>{courseRequirementsNote}</p>
          <p>We do not promise any particular test score or result. Ask us about the current schedule, format and fees.</p>
        </div>
        <aside className="space-y-10">
          <div className="rounded-[1.5rem] border border-line p-6">
            <h2 className="font-display text-2xl">Where it is used</h2>
            <ul className="mt-4 space-y-2 text-ivory-dim">
              {c.usedIn.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
          {dests.length ? (
            <div>
              <h2 className="font-display text-2xl">Related destinations</h2>
              <ul className="mt-4 space-y-2">
                {dests.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/destinations/${d.slug}`} className="flex min-h-11 items-center justify-between border-b border-line hover:text-gold">
                      {d.name} <Icon name="arrow-right" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h2 className="font-display text-2xl">Other courses</h2>
            <ul className="mt-4 space-y-2">
              {courses
                .filter((o) => o.slug !== c.slug)
                .map((o) => (
                  <li key={o.slug}>
                    <Link href={`/courses/${o.slug}`} className="flex min-h-11 items-center justify-between border-b border-line text-ivory-dim hover:text-ivory">
                      {o.name} <Icon name="arrow-right" size={16} />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </Container>
      <CtaBand title={`Ask about the ${c.name} course`} enquireHref={`/enquire?service=language-course&course=${c.slug}`} enquireLabel="Course enquiry" />
    </>
  );
}
