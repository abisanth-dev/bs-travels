import Link from "next/link";
import { notFound } from "next/navigation";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { checklistNotice, checklists, getChecklist } from "@/content/checklists";
import { getDestination } from "@/content/destinations";
import { whatsappHref } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return checklists.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = getChecklist((await params).slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.title} Document Checklist`,
    description: c.variants.length
      ? `A document checklist for the ${c.title}, from BS Travels in Jaffna. Confirm current requirements with our team.`
      : `Contact BS Travels in Jaffna for the latest ${c.title} document checklist.`,
    path: `/checklists/${c.slug}`,
    noindex: c.variants.length === 0,
  });
}

export default async function ChecklistPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getChecklist((await params).slug);
  if (!c) notFound();
  const dest = getDestination(c.destination);
  return (
    <>
      <div className="no-print">
        <PageHero
          eyebrow="Document checklist"
          title={c.title}
          crumbs={[
            { href: "/checklists", label: "Checklists" },
            { href: `/checklists/${c.slug}`, label: c.title },
          ]}
          lead={c.variants.length ? "Tick each document as you gather it. Your progress stays on this device only if you choose to remember it." : undefined}
        />
      </div>
      <Container className="grid gap-14 pb-24 lg:grid-cols-[1.5fr_0.9fr]">
        <div>
          {c.variants.length ? (
            <ChecklistView checklist={c} />
          ) : (
            <div className="rounded-[1.75rem] border border-line-strong bg-navy-2/70 p-8 sm:p-10">
              <h2 className="font-display text-3xl">Contact us for the latest checklist.</h2>
              <p className="mt-4 text-lg leading-relaxed text-ivory-dim">
                We have not published a {c.title.replace(/ Visa$/, "")} checklist on the website yet. Our team will tell you which
                documents to prepare for your situation.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href={`/enquire?service=visa-consultancy&destination=${c.destination}`} icon="arrow-right">
                  Ask for this checklist
                </LinkButton>
                <AnchorButton href={whatsappHref(`Hello BS Travels, please send me the latest ${c.title} document checklist.`)} target="_blank" rel="noopener noreferrer" variant="secondary" icon="whatsapp">
                  Ask on WhatsApp
                </AnchorButton>
              </div>
            </div>
          )}
          {c.typesWithoutDocuments?.length ? (
            <section aria-labelledby="types" className="mt-14 rounded-[1.5rem] border border-line p-7">
              <h2 id="types" className="font-display text-2xl">
                Other visa types
              </h2>
              <p className="mt-2 text-ivory-dim">Our reference material names these visa types. Contact us for the documents each one needs.</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {c.typesWithoutDocuments.map((t) => (
                  <div key={t.title}>
                    <h3 className="font-display text-xl">{t.title}</h3>
                    <ul className="mt-2 space-y-1 text-ivory-dim">
                      {t.types.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="no-print space-y-8">
          <div role="note" className="rounded-[1.5rem] border border-gold/40 bg-gold/5 p-6">
            <p className="flex items-center gap-2 font-medium text-gold">
              <Icon name="info" size={18} /> Please read
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{checklistNotice}</p>
          </div>
          {dest ? (
            <Link href={`/destinations/${dest.slug}`} className="flex min-h-12 items-center justify-between border-b border-line py-3 hover:text-gold">
              {dest.name} destination guide <Icon name="arrow-right" size={18} />
            </Link>
          ) : null}
          <Link href="/checklists" className="flex min-h-12 items-center justify-between border-b border-line py-3 text-ivory-dim hover:text-ivory">
            All checklists <Icon name="arrow-right" size={18} />
          </Link>
        </aside>
      </Container>
      <div className="no-print">
        <CtaBand title="Want us to review your documents?" enquireHref="/appointment?service=visa-consultancy" enquireLabel="Request an Appointment" />
      </div>
    </>
  );
}
