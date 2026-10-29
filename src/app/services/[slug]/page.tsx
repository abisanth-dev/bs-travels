import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { getChecklist } from "@/content/checklists";
import { getFaqs } from "@/content/faqs";
import { consultationProcess, getService, services } from "@/content/services";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  if (!s) return {};
  return pageMetadata({ title: s.name, description: `${s.summary} BS Travels, Jaffna, Sri Lanka.`, path: `/services/${s.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const faqs = getFaqs(s.faqIds);
  const checklists = s.relatedChecklists.map(getChecklist).filter((c) => c !== undefined);
  const others = services.filter((o) => o.slug !== s.slug);
  return (
    <>
      <PageHero
        eyebrow={`Service · Jaffna`}
        title={s.name}
        lead={s.intro[0]}
        crumbs={[
          { href: "/services", label: "Services" },
          { href: `/services/${s.slug}`, label: s.name },
        ]}
        align="split"
      >
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <LinkButton href={`/enquire?service=${s.slug}`} icon="arrow-right">
            Enquire about {s.name.toLowerCase()}
          </LinkButton>
          <LinkButton href={`/appointment?service=${s.slug}`} variant="secondary">
            Request an Appointment
          </LinkButton>
        </div>
      </PageHero>

      <Container className="grid gap-16 pb-24 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-line-strong text-gold">
            <Icon name={s.icon} size={36} strokeWidth={1.2} />
          </span>
          {s.intro.slice(1).map((p) => (
            <p key={p} className="mt-8 text-xl leading-relaxed text-ivory-dim">
              {p}
            </p>
          ))}
        </div>
        <div className="space-y-16">
          <section aria-labelledby="helps">
            <h2 id="helps" className="font-display text-3xl sm:text-4xl">
              What we can help with
            </h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {s.helpsWith.map((h) => (
                <li key={h} className="flex gap-4 py-4 text-lg">
                  <Icon name="check" className="mt-1 shrink-0 text-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="enquiries">
            <h2 id="enquiries" className="font-display text-3xl sm:text-4xl">
              Common enquiries
            </h2>
            <ul className="mt-8 flex flex-wrap gap-3">
              {s.enquiries.map((e) => (
                <li key={e} className="rounded-full border border-line-strong px-4 py-2 text-ivory-dim">
                  {e}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>

      <section aria-labelledby="process" className="border-y border-line bg-night py-24">
        <Container>
          <h2 id="process" className="font-display text-3xl sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {consultationProcess.map((p, i) => (
              <li key={p.title} className="border-t border-gold/60 pt-6">
                <span className="font-display text-sm text-gold">Step {i + 1}</span>
                <h3 className="font-display mt-2 text-2xl">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-ivory-dim">{p.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ivory-faint">
            Fees and timings depend on your situation and are explained before any work begins. Decisions on visas and immigration
            applications are made by the relevant authorities, and no outcome can be guaranteed.
          </p>
        </Container>
      </section>

      <Container className="grid gap-16 py-24 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {checklists.length ? (
            <section aria-labelledby="checklists">
              <h2 id="checklists" className="font-display text-3xl">
                Related checklists
              </h2>
              <ul className="mt-6 space-y-2">
                {checklists.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/checklists/${c.slug}`} className="flex min-h-12 items-center justify-between border-b border-line py-3 hover:text-gold">
                      {c.title} <Icon name="arrow-right" size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section aria-labelledby="more" className={checklists.length ? "mt-14" : ""}>
            <h2 id="more" className="font-display text-3xl">
              Other services
            </h2>
            <ul className="mt-6 space-y-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`} className="flex min-h-12 items-center justify-between border-b border-line py-3 text-ivory-dim hover:text-ivory">
                    {o.name} <Icon name="arrow-right" size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        {faqs.length ? (
          <section aria-labelledby="faqs">
            <h2 id="faqs" className="font-display text-3xl sm:text-4xl">
              Questions about {s.name.toLowerCase()}
            </h2>
            <div className="mt-8">
              <Accordion items={faqs.map((f) => ({ id: f.id, title: f.question, body: <p>{f.answer}</p> }))} />
            </div>
          </section>
        ) : null}
      </Container>
      <CtaBand
        title={`Talk to us about ${s.name.toLowerCase()}`}
        enquireHref={`/enquire?service=${s.slug}`}
        enquireLabel="Send an Enquiry"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.name,
          description: s.summary,
          provider: { "@id": `${site.url}/#organization` },
          areaServed: { "@type": "City", name: "Jaffna" },
          url: `${site.url}/services/${s.slug}`,
        }}
      />
    </>
  );
}
