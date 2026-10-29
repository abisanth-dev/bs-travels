import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/content/services";
import { BoardingPassMotif, DocumentMotif, LuggageMotif, PassportMotif } from "./Motifs";

const featuredMotif: Record<string, React.ReactNode> = {
  "visa-consultancy": <PassportMotif className="h-full w-full" />,
  "air-ticketing": <BoardingPassMotif className="h-full w-full" />,
  "immigration-support": <LuggageMotif className="h-full w-full" />,
};

export function ServicesSection() {
  const featured = services.filter((s) => s.featured);
  const supporting = services.filter((s) => !s.featured);
  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-20 bg-navy py-28 sm:py-36">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div data-reveal>
            <p className="eyebrow">What we do</p>
            <h2 id="services-title" className="font-display mt-5 text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[1.02]">
              Every detail.
              <br />
              <span className="text-ivory-dim">One trusted team.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-xl text-lg leading-relaxed text-ivory-dim lg:justify-self-end">
            BS Travels brings the practical side of travel under one roof in Jaffna, so you can plan a visit, a move or a holiday with
            the same people from the first question to the day you fly.
          </p>
        </div>

        <ol className="mt-16 grid gap-5 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
          {featured.map((s, i) => (
            <li
              key={s.slug}
              data-reveal
              data-reveal-delay={i * 0.08}
              className={`group relative overflow-hidden rounded-[1.75rem] border border-line bg-navy-2 ${
                i === 0 ? "lg:col-span-3 lg:row-span-2" : "lg:col-span-3"
              }`}
            >
              <Link href={`/services/${s.slug}`} className="flex h-full flex-col p-7 sm:p-9">
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-sm text-gold">0{i + 1}</span>
                  <Icon name="arrow-up-right" size={22} className="text-ivory-faint transition-colors group-hover:text-gold" />
                </div>
                <div
                  className={`pointer-events-none mx-auto my-6 w-full text-ivory/70 transition-transform duration-700 ease-out-soft group-hover:-translate-y-1 ${
                    i === 0 ? "max-w-[22rem] lg:my-12" : "max-w-[18rem]"
                  }`}
                >
                  {featuredMotif[s.slug]}
                </div>
                <div className="mt-auto">
                  <h3 className={`font-display leading-tight ${i === 0 ? "text-4xl sm:text-5xl" : "text-3xl"}`}>{s.name}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-ivory-dim">{s.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ivory underline-offset-8 group-hover:underline">
                    About {s.name.toLowerCase()} <Icon name="arrow-right" size={16} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid gap-10 rounded-[1.75rem] border border-line p-7 sm:p-9 lg:grid-cols-[0.8fr_2fr]">
          <div data-reveal>
            <h3 className="font-display text-2xl">Also from our Jaffna office</h3>
            <div className="mt-6 hidden max-w-[16rem] text-ivory/60 lg:block">
              <DocumentMotif className="h-full w-full" />
            </div>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {supporting.map((s, i) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[3rem_14rem_1fr_auto]"
                >
                  <span className="font-display text-sm text-gold">0{i + featured.length + 1}</span>
                  <span className="flex items-center gap-3 font-display text-xl">
                    <Icon name={s.icon} size={22} className="hidden text-ivory-faint sm:block" />
                    {s.name}
                  </span>
                  <span className="col-span-3 col-start-2 row-start-2 text-ivory-dim sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                    {s.summary}
                  </span>
                  <Icon
                    name="arrow-up-right"
                    size={20}
                    className="col-start-3 row-start-1 text-ivory-faint transition-colors group-hover:text-gold sm:col-start-auto"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
