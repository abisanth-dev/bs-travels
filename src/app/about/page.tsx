import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description: `BS Travels (Private) Limited is a one-stop travel support office on Navalar Road, Jaffna, Sri Lanka, led by Managing Director ${site.managingDirector.name}.`,
  path: "/about",
});

export default function AboutPage() {
  const md = site.managingDirector;
  return (
    <>
      <PageHero
        eyebrow="About BS Travels"
        title={
          <>
            Personal guidance. <span className="text-ivory-dim">Global possibilities.</span>
          </>
        }
        lead={site.tagline}
        crumbs={[{ href: "/about", label: "About" }]}
      />
      <Container className="grid gap-16 pb-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6 text-xl leading-relaxed text-ivory-dim">
          <p className="font-display text-3xl leading-snug text-ivory">
            Welcome to BS Travels. Whether you are planning a business trip, a holiday or a move abroad, we are here to make the journey
            smoother.
          </p>
          <p>
            We are a one-stop travel support office in Jaffna. Visas, air tickets, immigration paperwork, sworn translation, tour
            planning and international courier are all handled by one dedicated team.
          </p>
          <p>
            Every journey is unique. We take the time to understand yours and give you personal, professional help from the first
            conversation onwards.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line">
          <Image src="/images/about/jaffna.jpg" alt="Generated illustration of a calm coastline at sunset" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </Container>

      <section aria-labelledby="leader" className="border-y border-line bg-night py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          {md.portrait ? (
            <div className="relative aspect-[4/5] max-w-sm overflow-hidden rounded-[2rem]">
              <Image src={md.portrait} alt={`${md.name}, ${md.role}`} fill sizes="400px" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-square max-w-xs items-center justify-center rounded-full border border-gold/40 text-gold" aria-hidden>
              <Icon name="compass" size={96} strokeWidth={0.8} />
            </div>
          )}
          <div>
            <p className="eyebrow">Leadership</p>
            <h2 id="leader" className="font-display mt-4 text-5xl leading-tight">
              {md.name}
            </h2>
            <p className="mt-3 text-lg text-ivory-dim">
              {md.role} · {md.postNominals}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-dim">
              Leading the BS Travels team in Jaffna, with a commitment to personal, professional service for every traveller.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-24">
        <h2 className="font-display text-4xl">What we do</h2>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="group flex min-h-16 items-center gap-4 border-b border-line py-4">
                <Icon name={s.icon} className="text-gold" />
                <span className="font-display text-xl group-hover:text-gold">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { k: "Office", v: `${site.address.street}, ${site.address.locality} ${site.address.postalCode}, ${site.address.country}` },
            { k: "Hours", v: site.hours.summary },
            { k: "Company", v: site.legalName },
          ].map((x) => (
            <div key={x.k} className="rounded-[1.5rem] border border-line p-6">
              <p className="eyebrow">{x.k}</p>
              <p className="mt-3 leading-relaxed text-ivory-dim">{x.v}</p>
            </div>
          ))}
        </div>
      </Container>
      <CtaBand title="Want to know more about us?" body={`Call us on ${site.phone.display} or drop in to our office on Navalar Road.`} />
    </>
  );
}
