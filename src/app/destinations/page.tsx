import { DestinationFilter } from "@/components/destinations/DestinationFilter";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Destinations",
  description: "Destination guides from BS Travels in Jaffna, Sri Lanka. Enquire about visas, flights and travel plans for the places you want to go.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={
          <>
            From Jaffna, <span className="text-ivory-dim">to almost anywhere.</span>
          </>
        }
        lead="These guides cover places people often ask us about. They are a starting point for an enquiry, not fixed packages. Every plan is shaped with you."
        crumbs={[{ href: "/destinations", label: "Destinations" }]}
      />
      <Container className="pb-24">
        <DestinationFilter />
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ivory-faint">
          Artwork on this page is generated illustration, not photography. BS Travels has one office, in Jaffna, Sri Lanka. Listing a
          destination does not mean we have an office there or that any visa or service is guaranteed.
        </p>
      </Container>
      <CtaBand title="Somewhere not listed?" body="Tell us where you are thinking of going. We will let you know how we can help." />
    </>
  );
}
