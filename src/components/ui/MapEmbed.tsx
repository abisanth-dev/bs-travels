"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { Icon } from "./Icon";
import { buttonClass } from "./Button";

/** The Google map loads only when asked, which keeps the page fast and private. */
export function MapEmbed() {
  const [load, setLoad] = useState(false);
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-line bg-navy-2">
      {load ? (
        <iframe
          title={`Map showing ${site.legalName}, ${site.address.street}, Jaffna`}
          src={site.maps.embed}
          className="absolute inset-0 h-full w-full border-0 grayscale-[30%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <svg viewBox="0 0 200 120" className="w-56 text-ivory/30" aria-hidden>
            <path d="M10 90 C60 70 80 100 120 70 S180 40 190 50" fill="none" stroke="currentColor" />
            <path d="M20 30 L180 100 M40 110 L160 10" stroke="currentColor" strokeDasharray="2 4" />
            <circle cx="104" cy="62" r="6" fill="var(--color-gold)" />
            <circle cx="104" cy="62" r="14" fill="none" stroke="var(--color-gold)" strokeOpacity=".5" />
          </svg>
          <p className="max-w-xs text-ivory-dim">{site.address.street}, Jaffna. Load the interactive map from Google, or open it in Google Maps.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setLoad(true)} className={buttonClass("secondary")}>
              Show map
            </button>
            <a href={site.maps.link} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost")}>
              Open in Google Maps <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
