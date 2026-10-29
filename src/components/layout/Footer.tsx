import Link from "next/link";
import { primaryNav, secondaryNav } from "@/content/navigation";
import { services } from "@/content/services";
import { mailHref, site, telHref, whatsappHref } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-line bg-night">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo />
          <p className="font-display mt-6 max-w-xs text-2xl leading-snug text-ivory">{site.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory-dim">
            One trusted team in Jaffna for visas, flights, immigration support, translation, tours and courier.
          </p>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-ivory-dim hover:text-ivory"
          >
            <Icon name="facebook" size={18} /> BS Travels on Facebook
          </a>
        </div>

        <nav aria-label="Services">
          <h2 className="eyebrow">Services</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-ivory-dim hover:text-ivory">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Explore">
          <h2 className="eyebrow">Explore</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[...primaryNav, ...secondaryNav].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ivory-dim hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Visit or contact us</h2>
          <address className="mt-5 space-y-4 text-sm not-italic leading-relaxed text-ivory-dim">
            <p className="flex gap-3">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {site.legalName}
                <br />
                {site.address.street}, {site.address.locality} {site.address.postalCode}
                <br />
                {site.address.country}
              </span>
            </p>
            <p className="flex gap-3">
              <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={telHref()} className="hover:text-ivory">
                {site.phone.display}
              </a>
            </p>
            <p className="flex gap-3">
              <Icon name="whatsapp" size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">
                Chat on WhatsApp
              </a>
            </p>
            <p className="flex gap-3">
              <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-gold" />
              <span className="flex flex-col">
                <a href={mailHref(site.email.primary)} className="hover:text-ivory">
                  {site.email.primary}
                </a>
                <a href={mailHref(site.email.secondary)} className="hover:text-ivory">
                  {site.email.secondary}
                </a>
              </span>
            </p>
            <p className="flex gap-3">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>{site.hours.summary}</span>
            </p>
          </address>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-xs text-ivory-faint sm:flex-row sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p>Destination markers and guides are for enquiries only. BS Travels’ office is in Jaffna, Sri Lanka.</p>
        </Container>
      </div>
    </footer>
  );
}
