import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/Button";
import { site } from "@/content/site";

export function AboutSection() {
  const md = site.managingDirector;
  return (
    <section data-flight="about" aria-labelledby="about-title" className="relative bg-navy py-28 sm:py-36">
      <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line" data-reveal>
            <Image
              src="/images/about/jaffna.jpg"
              alt="Generated illustration of a calm coastline at sunset"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 to-transparent p-7 pt-24">
              <p className="eyebrow">Our office</p>
              <p className="font-display mt-2 text-2xl">
                {site.address.street}
                <br />
                {site.address.locality}, {site.address.country}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow" data-reveal>
            About BS Travels
          </p>
          <h2 id="about-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]" data-reveal>
            Personal guidance. <span className="text-ivory-dim">Global possibilities.</span>
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ivory-dim" data-reveal>
            <p>
              BS Travels is a one-stop travel support office in Jaffna. Visas, flights, immigration paperwork, sworn translation, tours
              and courier are all handled by the same team, so you never have to piece your journey together alone.
            </p>
            <p>
              Whether you are travelling for business, taking a holiday or starting a new life abroad, every journey is different. We
              take the time to understand yours and give you personal, professional support from start to finish.
            </p>
          </div>
          <figure className="mt-10 border-l border-gold pl-6" data-reveal>
            <figcaption>
              <span className="font-display block text-2xl text-ivory">
                {md.name}
                <span className="ml-2 align-middle text-sm font-normal tracking-wide text-ivory-faint">{md.postNominals}</span>
              </span>
              <span className="mt-1 block text-sm uppercase tracking-[0.2em] text-gold">{md.role}</span>
            </figcaption>
          </figure>
          <div className="mt-10" data-reveal>
            <LinkButton href="/about" variant="secondary" icon="arrow-right">
              More about us
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
