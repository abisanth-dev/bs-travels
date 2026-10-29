import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { getDestination, type Destination } from "@/content/destinations";

const picks = ["canada", "dubai-uae", "japan", "thailand", "united-kingdom"];

function Panel({ d, large = false }: { d: Destination; large?: boolean }) {
  return (
    <article className={`group relative isolate overflow-hidden rounded-[1.75rem] border border-line ${large ? "min-h-[34rem]" : "min-h-[22rem]"}`}>
      <Image
        src={d.image?.src ?? `/images/destinations/${d.slug}.jpg`}
        alt={d.image?.alt ?? `Generated illustration evoking ${d.name}`}
        fill
        sizes={large ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
        className="-z-10 object-cover transition-transform duration-[1600ms] ease-out-soft group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden />
      <div className="flex h-full flex-col justify-end p-7 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">{d.kind === "city" ? `City · ${d.country}` : "Country"}</p>
        <h3 className={`font-display mt-2 leading-tight ${large ? "text-5xl sm:text-6xl" : "text-3xl"}`}>{d.name}</h3>
        <p className={`mt-3 max-w-md text-ivory-dim ${large ? "text-lg" : ""}`}>{d.headline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/enquire?destination=${d.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory px-5 text-sm font-medium text-night hover:bg-gold"
          >
            Enquire About This Destination
          </Link>
          <Link href={`/destinations/${d.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory hover:text-gold">
            Guide <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DestinationsSection() {
  const list = picks.map(getDestination).filter((d): d is Destination => Boolean(d));
  const [first, ...rest] = list;
  return (
    <section data-flight="explore" aria-labelledby="explore-title" className="relative bg-navy py-28 sm:py-36">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow">Explore destinations</p>
            <h2 id="explore-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]">
              Places worth the journey.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory-dim">
              Destination guides to spark ideas. Tell us where you are thinking of going and we will help with the visa, the flights
              and the plan.
            </p>
          </div>
          <LinkButton href="/destinations" variant="secondary" icon="arrow-right" className="self-start md:self-auto">
            All destinations
          </LinkButton>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div data-reveal>
            <Panel d={first} large />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {rest.map((d, i) => (
              <div key={d.slug} data-reveal data-reveal-delay={i * 0.06}>
                <Panel d={d} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
