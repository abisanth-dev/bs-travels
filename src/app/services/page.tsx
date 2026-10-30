import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceFilter } from "@/components/services/ServiceFilter";
import { consultationProcess } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Visa consultancy, air ticketing, immigration support, sworn translation, tour packages, visa extension and international courier from BS Travels in Jaffna.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Seven services. <span className="text-ivory-dim">One team in Jaffna.</span>
          </>
        }
        lead="Reliable, professional travel support matters more than ever. Whether you are visiting, moving or holidaying, we handle the practical details with you."
        crumbs={[{ href: "/services", label: "Services" }]}
      />
      <Container className="pb-24">
        <ServiceFilter />
      </Container>
      <section aria-labelledby="process-title" className="border-t border-line bg-night py-24">
        <Container>
          <h2 id="process-title" className="font-display text-4xl sm:text-5xl">
            How a consultation works
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {consultationProcess.map((p, i) => (
              <li key={p.title} className="border-t border-gold/60 pt-6">
                <span className="font-display text-sm text-gold">Step {i + 1}</span>
                <h3 className="font-display mt-2 text-2xl">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-ivory-dim">{p.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
