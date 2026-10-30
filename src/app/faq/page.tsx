import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to common questions about BS Travels’ visa, ticketing, immigration, translation, tour and courier services in Jaffna.",
  path: "/faq",
});

const groups = [
  { id: "general", label: "Getting started" },
  { id: "visas", label: "Visas and immigration" },
  { id: "travel", label: "Flights and tours" },
  { id: "documents", label: "Translation and courier" },
] as const;

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Questions, answered." lead="If your question is not here, call or message us. We are happy to help." crumbs={[{ href: "/faq", label: "FAQ" }]} />
      <Container className="grid gap-16 pb-24 lg:grid-cols-[0.6fr_1.4fr]">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="space-y-1">
            {groups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="flex min-h-11 items-center text-ivory-dim hover:text-ivory">
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-28">
              <h2 id={`${g.id}-h`} className="eyebrow">
                {g.label}
              </h2>
              <div className="mt-4">
                <Accordion items={faqs.filter((f) => f.topic === g.id).map((f) => ({ id: f.id, title: f.question, body: <p>{f.answer}</p> }))} />
              </div>
            </section>
          ))}
        </div>
      </Container>
      <CtaBand />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
    </>
  );
}
