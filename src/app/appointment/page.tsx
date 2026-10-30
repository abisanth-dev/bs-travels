import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/content/site";
import { isSubmissionConfigured } from "@/lib/forms/deliver";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Request an Appointment",
  description: "Request a consultation with BS Travels at our Jaffna office or by phone. The team will confirm the time with you.",
  path: "/appointment",
});

export default async function AppointmentPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Request an Appointment"
        lead="Choose a service and a preferred day and time. This is a request, not a booking: our team will contact you to confirm a time that works."
        crumbs={[{ href: "/appointment", label: "Request an appointment" }]}
      />
      <Container className="grid gap-14 pb-28 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-[2rem] border border-line bg-navy-2/60 p-6 sm:p-10">
          <AppointmentForm configured={isSubmissionConfigured()} initialService={sp.service} />
        </div>
        <aside className="space-y-8">
          <div className="rounded-[1.5rem] border border-line p-6">
            <h2 className="font-display text-2xl">Office hours</h2>
            <dl className="mt-4 divide-y divide-line text-sm">
              {site.hours.rows.map((r) => (
                <div key={r.days} className="flex justify-between gap-4 py-3">
                  <dt className="text-ivory-dim">{r.days}</dt>
                  <dd>{r.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex gap-3 text-sm leading-relaxed text-ivory-dim">
            <Icon name="pin" className="mt-0.5 shrink-0 text-gold" />
            <p>
              {site.legalName}
              <br />
              {site.address.street}, {site.address.locality} {site.address.postalCode}, {site.address.country}
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
