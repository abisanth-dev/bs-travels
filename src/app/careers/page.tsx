import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { AnchorButton } from "@/components/ui/Button";
import { mailHref, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Careers",
  description: "Interested in working at BS Travels in Jaffna? Send us your CV.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Help people take their next step."
        lead="We are a Jaffna team helping people travel, study, work and reunite with family around the world."
        crumbs={[{ href: "/careers", label: "Careers" }]}
      />
      <Container className="grid gap-12 pb-28 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-ivory-dim">
          <h2 className="font-display text-3xl text-ivory">Current openings</h2>
          <p>
            There are no vacancies listed on the website at the moment. When a role opens, we will list it on this page.
          </p>
          <p>
            If you would like to be considered for future roles, you are welcome to send your CV. Tell us a little about yourself and
            the kind of work you are interested in.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-line-strong bg-navy-2/70 p-8">
          <h2 className="font-display text-2xl">Send your CV</h2>
          <p className="mt-3 break-all text-ivory-dim">{site.careersEmail}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AnchorButton href={mailHref(site.careersEmail, "CV for BS Travels", "Hello BS Travels,\n\nPlease find my CV attached.\n\nName:\nPhone:\nArea of interest:\n")} icon="mail">
              Email your CV
            </AnchorButton>
            <AnchorButton href={site.social.facebook} target="_blank" rel="noopener noreferrer" variant="secondary" icon="facebook">
              Facebook
            </AnchorButton>
          </div>
          <p className="mt-6 text-sm text-ivory-faint">Please attach your CV to the email. We only use it to consider you for roles at BS Travels.</p>
        </div>
      </Container>
    </>
  );
}
