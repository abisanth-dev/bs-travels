"use client";

import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";
import { useStage } from "./HomeExperience";

export function HeroSection() {
  const { heroSlot, ready, tier } = useStage();
  const live = ready && (tier === "low" || tier === "high");

  return (
    <section aria-labelledby="hero-title" data-flight="hero" className="relative">
      <div ref={heroSlot} className="relative flex min-h-[640px] h-[100svh] items-end overflow-hidden md:items-center">
        {/* Poster renders immediately and stays for static visitors. */}
        <div className={`absolute inset-0 transition-opacity duration-[1400ms] ${live ? "opacity-0" : "opacity-100"}`} aria-hidden>
          <Image
            src="/images/hero/poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_50%]"
          />
        </div>
        {/* Legibility wash behind the headline. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(90deg, rgb(6 11 23 / 0.78) 0%, rgb(6 11 23 / 0.45) 38%, rgb(6 11 23 / 0) 62%), linear-gradient(0deg, rgb(10 19 38 / 1) 0%, rgb(10 19 38 / 0) 22%)",
          }}
        />
        <Container className="relative pb-24 pt-[calc(var(--header-h)+2rem)] md:pb-0">
          <div className="max-w-[40rem]">
            <p className="eyebrow">BS Travels · Jaffna, Sri Lanka</p>
            <h1 id="hero-title" className="font-display mt-5 text-[clamp(3rem,7.4vw,6.6rem)] leading-[0.98] text-ivory">
              Your next chapter <em className="font-light italic text-gold">begins</em> here.
            </h1>
            <p className="mt-7 max-w-[32rem] text-lg leading-relaxed text-ivory-dim sm:text-xl">
              From visa guidance and flight bookings to unforgettable journeys, we help you move forward with confidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/enquire" icon="arrow-right">
                Plan My Journey
              </LinkButton>
              <LinkButton href="#services" variant="secondary">
                Explore Our Services
              </LinkButton>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivory-dim">
              <li className="flex items-center gap-2">
                <Icon name="pin" size={16} className="text-gold" /> {site.address.street}, Jaffna
              </li>
              <li className="flex items-center gap-2">
                <Icon name="clock" size={16} className="text-gold" /> Mon to Fri, 9 AM to 5 PM
              </li>
            </ul>
          </div>
        </Container>
        <a
          href="#services"
          className="absolute bottom-6 right-6 hidden items-center gap-3 text-xs uppercase tracking-[0.22em] text-ivory-faint hover:text-ivory md:inline-flex lg:right-12"
        >
          Scroll to begin
          <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-gold" />
          </span>
        </a>
      </div>
    </section>
  );
}
