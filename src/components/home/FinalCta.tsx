import { Container } from "@/components/layout/Container";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { whatsappHref } from "@/content/site";

/** The flight path comes in to land on this warm horizon. */
export function FinalCta() {
  return (
    <section data-flight="final" aria-labelledby="final-title" className="relative isolate overflow-hidden pb-28 pt-36 sm:pb-36 sm:pt-48">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-[#1a1f3d] to-[#3a2a3a]" />
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_70%_at_50%_100%,rgb(240_168_104/0.55),rgb(228_138_92/0.18)_45%,transparent_75%)]" />
        <div className="absolute inset-x-[-10%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-[#f6c995] to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-b from-[#2b1f2c] to-night" />
      </div>
      <Container className="relative text-center">
        <p className="eyebrow" data-reveal>
          Your journey starts in Jaffna
        </p>
        <h2 id="final-title" className="font-display mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,7vw,6rem)] leading-[1]" data-reveal>
          Where would you like to go next?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory-dim" data-reveal>
          Talk to our team in person, by phone or on WhatsApp. We will help you work out the next step.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
          <LinkButton href="/appointment" icon="calendar">
            Book a Consultation
          </LinkButton>
          <AnchorButton href={whatsappHref("Hello BS Travels, I would like to plan a journey.")} target="_blank" rel="noopener noreferrer" variant="secondary" icon="whatsapp">
            Chat on WhatsApp
          </AnchorButton>
        </div>
        <span data-flight-node="landing" className="mx-auto mt-24 block h-px w-px" aria-hidden />
      </Container>
    </section>
  );
}
