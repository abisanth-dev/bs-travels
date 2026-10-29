import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Container } from "./Container";

/**
 * Inner-page opener. Pages pass their own art and accent so each one keeps
 * its own character while sharing a layout.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs: Crumb[];
  image?: { src: string; alt: string };
  children?: ReactNode;
  align?: "left" | "split";
}) {
  return (
    <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+2.5rem)]">
      {image ? (
        <>
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="-z-20 object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/60 to-navy" aria-hidden />
        </>
      ) : (
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 80% at 85% 0%, rgb(227 180 103 / 0.14), transparent 60%), radial-gradient(50% 70% at 0% 20%, rgb(148 184 227 / 0.10), transparent 60%)",
          }}
        />
      )}
      <Container className="pb-16 sm:pb-20">
        <Breadcrumbs items={crumbs} />
        <div className={align === "split" ? "mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end" : "mt-10"}>
          <div className="max-w-3xl">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="font-display mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] text-ivory">{title}</h1>
            {lead ? <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-dim">{lead}</div> : null}
          </div>
          {children ? <div>{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
