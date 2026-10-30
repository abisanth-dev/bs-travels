import { site, whatsappHref } from "@/content/site";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { Container } from "./Container";

export function CtaBand({
  title = "Ready to talk it through?",
  body = `Visit us on Navalar Road in Jaffna, call ${site.phone.display}, or send an enquiry and our team will get back to you.`,
  enquireHref = "/enquire",
  enquireLabel = "Send an Enquiry",
}: {
  title?: string;
  body?: string;
  enquireHref?: string;
  enquireLabel?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-t border-line">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{ background: "radial-gradient(70% 120% at 50% 120%, rgb(228 138 92 / 0.28), transparent 60%)" }}
      />
      <Container className="flex flex-col items-start gap-8 py-20 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory-dim">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={enquireHref} icon="arrow-right">
            {enquireLabel}
          </LinkButton>
          <AnchorButton href={whatsappHref()} target="_blank" rel="noopener noreferrer" variant="secondary" icon="whatsapp">
            Chat on WhatsApp
          </AnchorButton>
        </div>
      </Container>
    </section>
  );
}
