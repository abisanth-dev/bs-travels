import { EnquiryFlow } from "@/components/forms/EnquiryFlow";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Icon } from "@/components/ui/Icon";
import { mailHref, site, telHref, whatsappHref } from "@/content/site";
import { isSubmissionConfigured } from "@/lib/forms/deliver";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: `Visit BS Travels at ${site.address.street}, Jaffna, call ${site.phone.display}, message us on WhatsApp or send an enquiry.`,
  path: "/contact",
});

export default function ContactPage() {
  const rows = [
    { icon: "phone" as const, label: "Call", value: site.phone.display, href: telHref() },
    { icon: "whatsapp" as const, label: "WhatsApp", value: "Chat with our team", href: whatsappHref(), external: true },
    { icon: "mail" as const, label: "Email", value: site.email.primary, href: mailHref(site.email.primary) },
    { icon: "mail" as const, label: "Also", value: site.email.secondary, href: mailHref(site.email.secondary) },
  ];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Come and see us in Jaffna."
        lead="Our office is on Navalar Road. Call, message, email or visit, whichever is easiest for you."
        crumbs={[{ href: "/contact", label: "Contact" }]}
      />
      <Container className="grid gap-12 pb-20 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-10">
          <address className="not-italic">
            <p className="eyebrow">Office</p>
            <p className="font-display mt-3 text-3xl leading-snug">
              {site.address.street}
              <br />
              {site.address.locality} {site.address.postalCode}
              <br />
              {site.address.country}
            </p>
          </address>
          <ul className="divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <li key={r.value}>
                <a
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex min-h-16 items-center gap-4 py-3 hover:text-gold"
                >
                  <Icon name={r.icon} className="text-gold" />
                  <span className="w-24 text-sm text-ivory-faint">{r.label}</span>
                  <span className="break-all">{r.value}</span>
                </a>
              </li>
            ))}
          </ul>
          <div>
            <p className="eyebrow">Hours</p>
            <dl className="mt-3 divide-y divide-line text-sm">
              {site.hours.rows.map((r) => (
                <div key={r.days} className="flex justify-between py-3">
                  <dt className="text-ivory-dim">{r.days}</dt>
                  <dd>{r.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-ivory-dim hover:text-ivory">
            <Icon name="facebook" /> Follow BS Travels on Facebook
          </a>
        </div>
        <MapEmbed />
      </Container>
      <section aria-labelledby="contact-form" className="border-t border-line py-20">
        <Container className="max-w-4xl">
          <h2 id="contact-form" className="font-display text-4xl">
            Send us a message
          </h2>
          <div className="mt-10 rounded-[2rem] border border-line bg-navy-2/60 p-6 sm:p-10">
            <EnquiryFlow configured={isSubmissionConfigured()} compact />
          </div>
        </Container>
      </section>
    </>
  );
}
