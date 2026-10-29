import Image from "next/image";
import { site } from "@/content/site";

/**
 * Shows the original logo once it is added to site.brand.logo, at its real
 * proportions. Until then a typographic wordmark stands in.
 */
export function Logo({ className = "" }: { className?: string }) {
  const logo = site.brand.logo;
  if (logo) {
    return (
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={site.legalName}
        priority
        className={`h-9 w-auto ${className}`}
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
        <circle cx="17" cy="17" r="15.5" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <path d="M6 22c4.5-9 13.5-13 22-11" fill="none" stroke="var(--color-gold)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="28" cy="11" r="1.8" fill="var(--color-gold)" />
        <circle cx="6" cy="22" r="1.4" fill="currentColor" />
      </svg>
      <span className="leading-none">
        <span className="font-display block text-[1.15rem] font-semibold tracking-tight">BS Travels</span>
        <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.24em] text-ivory-faint">Jaffna · Sri Lanka</span>
      </span>
    </span>
  );
}
