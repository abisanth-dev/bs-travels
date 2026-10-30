"use client";

import Image from "next/image";
import { useId } from "react";
import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { site, telHref } from "@/content/site";
import { useStage } from "./HomeExperience";
import { sceneState, useSceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/** About: the island in relief, with Jaffna as the place every journey starts. */
export function AboutSection() {
  const uid = useId();
  const md = site.managingDirector;
  const { live, anchors } = useStage();
  const open = useSceneState((s) => s.jaffnaOpen);

  const marker = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`${uid}-office`}
      onClick={() => sceneState.set({ jaffnaOpen: !open })}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/70 bg-night/85 px-4 text-sm text-ivory shadow-lg backdrop-blur hover:border-gold"
    >
      <Icon name="pin" size={16} className="text-gold" />
      {open ? "Hide office details" : "Jaffna · our office"}
    </button>
  );

  return (
    <section data-flight="about" aria-labelledby="about-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
        <div className="relative">
          <SceneSlot name="about" className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] sm:aspect-[5/4]" posterClassName="object-cover">
            {live ? (
              <span
                ref={(el) => {
                  if (el) anchors.current.set("jaffna", el);
                  else anchors.current.delete("jaffna");
                }}
                className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] opacity-0 transition-opacity"
              >
                {marker}
              </span>
            ) : null}
          </SceneSlot>
          {live ? null : <div className="mt-4">{marker}</div>}
          <div
            id={`${uid}-office`}
            hidden={!open}
            className="mt-4 rounded-[1.25rem] border border-line-strong bg-navy-2/95 p-6 sm:absolute sm:bottom-6 sm:left-6 sm:mt-0 sm:max-w-sm"
          >
            <p className="eyebrow">Our office</p>
            <p className="font-display mt-2 text-2xl">{site.legalName}</p>
            <p className="mt-2 text-ivory-dim">
              {site.address.street}, {site.address.locality} {site.address.postalCode}, {site.address.country}
            </p>
            <p className="mt-2 text-ivory-dim">Monday to Friday, 9:00 AM to 5:00 PM. Saturday half day.</p>
            <a href={telHref()} className="mt-3 inline-flex min-h-11 items-center gap-2 text-ivory hover:text-gold">
              <Icon name="phone" size={16} className="text-gold" /> {site.phone.display}
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow" data-reveal>
            About BS Travels · Our journey begins in Jaffna
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
          <figure className="mt-10 flex items-center gap-5" data-reveal>
            {md.portrait ? (
              <div className="portrait-reveal relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-line-strong">
                <Image src={md.portrait} alt={`${md.name}, ${md.role}`} fill sizes="80px" className="object-cover" />
              </div>
            ) : null}
            <figcaption className="border-l border-gold pl-6">
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
