import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Mini3D } from "@/components/three/Mini3D";
import { publishedArticles } from "@/content/articles";
import { getChecklist } from "@/content/checklists";
import { courses } from "@/content/courses";
import { destinations, getDestination, origin, regions } from "@/content/destinations";
import { getService } from "@/content/services";
import { distanceKm } from "@/lib/geo";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDestination((await params).slug);
  if (!d) return {};
  return pageMetadata({
    title: `${d.name} Travel Enquiries`,
    description: `${d.headline}. Enquire with BS Travels in Jaffna about visas, flights and plans for ${d.name}.`,
    path: `/destinations/${d.slug}`,
    image: d.image?.src ?? `/images/destinations/${d.slug}.jpg`,
  });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  const checklist = d.checklist ? getChecklist(d.checklist) : undefined;
  const services = d.services.map(getService).filter((s) => s !== undefined);
  const relatedCourses = courses.filter((c) => c.destinations.includes(d.slug));
  const articles = publishedArticles().filter((a) => a.relatedDestination === d.slug);
  const km = Math.round(distanceKm(origin, d.marker) / 100) * 100;
  return (
    <>
      <PageHero
        eyebrow={d.kind === "city" ? `City in ${d.country}` : regions.find((r) => r.id === d.region)?.label}
        title={d.name}
        lead={d.intro}
        crumbs={[
          { href: "/destinations", label: "Destinations" },
          { href: `/destinations/${d.slug}`, label: d.name },
        ]}
        image={{ src: d.image?.src ?? `/images/destinations/${d.slug}.jpg`, alt: d.image?.alt ?? `Generated illustration evoking ${d.name}` }}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href={`/enquire?destination=${d.slug}`} icon="arrow-right">
            Enquire About This Destination
          </LinkButton>
          {checklist ? (
            <LinkButton href={`/checklists/${checklist.slug}`} variant="secondary">
              {checklist.variants.length ? "Document checklist" : "Ask for the latest checklist"}
            </LinkButton>
          ) : null}
        </div>
      </PageHero>

      <Container className="grid gap-16 py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-3xl">{d.headline}</h2>
          <ul className="mt-8 space-y-4">
            {d.highlights.map((h) => (
              <li key={h} className="flex items-center gap-4 border-b border-line pb-4 text-lg">
                <Icon name="sparkle" size={18} className="text-gold" /> {h}
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-ivory-faint">Shown on our globe at</dt>
              <dd className="mt-1 text-ivory">
                {d.marker.place}
                {d.marker.placeKind === "capital" ? " (capital)" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-ivory-faint">Distance from Jaffna</dt>
              <dd className="mt-1 text-ivory">About {km.toLocaleString("en-US")} km, as the crow flies</dd>
            </div>
          </dl>
          <Mini3D spec={{ type: "route", lat: d.marker.lat, lng: d.marker.lng }} className="mt-10 aspect-square w-full max-w-md">
            <Image src="/images/globe/static.png" alt="" fill sizes="28rem" className="object-contain opacity-80" />
          </Mini3D>
          <p className="mt-2 max-w-md text-xs text-ivory-faint">Route from our Jaffna office to {d.marker.place}. The marker shows an enquiry destination, not a BS Travels office.</p>
        </div>
        <div className="space-y-12">
          <section aria-labelledby="help">
            <h2 id="help" className="font-display text-3xl">
              How we can help
            </h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5">
                    <Icon name={s.icon} className="text-gold" />
                    <span>
                      <span className="font-display block text-xl">{s.name}</span>
                      <span className="mt-1 block text-sm text-ivory-dim">{s.summary}</span>
                    </span>
                    <Icon name="arrow-right" size={18} className="text-ivory-faint group-hover:text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {relatedCourses.length ? (
            <section aria-labelledby="langs">
              <h2 id="langs" className="font-display text-2xl">
                Language courses
              </h2>
              <p className="mt-3 text-ivory-dim">Some application routes involve a language test. Requirements vary, so ask us what applies to you.</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {relatedCourses.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/courses/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 hover:border-ivory">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {articles.length ? (
            <section aria-labelledby="reading">
              <h2 id="reading" className="font-display text-2xl">
                From our archive
              </h2>
              <ul className="mt-4 space-y-2">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="text-ivory-dim underline underline-offset-4 hover:text-ivory">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
      <Container className="pb-16">
        <p className="max-w-3xl text-sm leading-relaxed text-ivory-faint">
          This is a general destination guide to help start a conversation. It is not a tour package, and it does not describe visa
          rules. The artwork is a generated illustration. BS Travels’ only office is in Jaffna, Sri Lanka.
        </p>
      </Container>
      <CtaBand title={`Thinking about ${d.name}?`} enquireHref={`/enquire?destination=${d.slug}`} enquireLabel="Enquire About This Destination" />
    </>
  );
}
