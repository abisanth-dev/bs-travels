import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { EnquiryFlow } from "@/components/forms/EnquiryFlow";
import { Icon } from "@/components/ui/Icon";
import { site, telHref, whatsappHref } from "@/content/site";
import { isSubmissionConfigured } from "@/lib/forms/deliver";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Plan Your Journey",
  description: "Send BS Travels an enquiry about visas, flights, immigration support, translation, tours, courier or language courses.",
  path: "/enquire",
});

type Search = Promise<{ service?: string; destination?: string; course?: string }>;

export default async function EnquirePage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const configured = isSubmissionConfigured();
  return (
    <>
      <PageHero
        eyebrow="Journey enquiry"
        title="Plan your journey with us."
        lead="Four short steps. Tell us what you need and how to reach you, and our team in Jaffna will get back to you."
        crumbs={[{ href: "/enquire", label: "Plan your journey" }]}
      />
      <Container className="grid gap-14 pb-28 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-[2rem] border border-line bg-navy-2/60 p-6 sm:p-10">
          <EnquiryFlow configured={configured} initial={{ topic: sp.service, destination: sp.destination, course: sp.course }} />
        </div>
        <aside className="space-y-8 text-ivory-dim">
          <div>
            <h2 className="font-display text-2xl text-ivory">Prefer to talk?</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a href={telHref()} className="flex min-h-11 items-center gap-3 hover:text-ivory">
                  <Icon name="phone" className="text-gold" /> {site.phone.display}
                </a>
              </li>
              <li>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 hover:text-ivory">
                  <Icon name="whatsapp" className="text-gold" /> Chat on WhatsApp
                </a>
              </li>
              <li className="flex gap-3">
                <Icon name="clock" className="mt-0.5 shrink-0 text-gold" /> {site.hours.summary}
              </li>
            </ul>
          </div>
          <p className="border-t border-line pt-8 text-sm leading-relaxed">
            We use your details only to respond to this enquiry. Visa and immigration decisions are made by the relevant authorities,
            and we never guarantee an outcome.
          </p>
        </aside>
      </Container>
    </>
  );
}
