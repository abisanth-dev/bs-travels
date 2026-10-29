"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { checklistItemCount, checklists } from "@/content/checklists";

export function PrepareSection() {
  const router = useRouter();
  const id = useId();
  const [slug, setSlug] = useState("canada");
  const current = checklists.find((c) => c.slug === slug)!;
  const preview = current.variants[0]?.groups[0]?.items.slice(0, 4) ?? [];
  const total = checklistItemCount(current);

  return (
    <section data-flight="prepare" aria-labelledby="prepare-title" className="relative overflow-x-clip bg-navy py-28 sm:py-36">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div data-reveal>
          <p className="eyebrow">Journey preparation</p>
          <h2 id="prepare-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.03]">
            Prepare with confidence.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory-dim">
            Start gathering your documents with our checklists. Tick items off as you go, print the list, and bring it to your
            consultation.
          </p>
          <form
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/checklists/${slug}`);
            }}
          >
            <div className="flex-1">
              <label htmlFor={id} className="block text-sm text-ivory-dim">
                Destination
              </label>
              <div className="relative mt-2">
                <select
                  id={id}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="min-h-12 w-full appearance-none rounded-full border border-line-strong bg-navy-2 px-5 pr-12 text-ivory"
                >
                  {checklists.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                      {c.variants.length ? "" : " (ask us)"}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-ivory-faint" />
              </div>
            </div>
            <button type="submit" className={buttonClass("primary")}>
              Open checklist <Icon name="arrow-right" size={18} />
            </button>
          </form>
        </div>

        <div className="relative" data-reveal>
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_60%_40%,rgb(227_180_103/0.12),transparent)]" aria-hidden />
          <div className="rotate-[-1.5deg] rounded-[1.75rem] border border-line-strong bg-ivory p-8 text-night shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
            <div className="flex items-start justify-between gap-4 border-b border-night/15 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-night/60">Document checklist</p>
                <p className="font-display mt-1 text-3xl">{current.title}</p>
              </div>
              <Icon name="document" size={28} className="text-gold-deep" />
            </div>
            {preview.length ? (
              <>
                <ul className="mt-5 space-y-3">
                  {preview.map((item, i) => (
                    <li key={item} className="flex gap-3 text-[0.95rem] leading-snug">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          i < 2 ? "border-gold-deep bg-gold-deep text-ivory" : "border-night/30"
                        }`}
                        aria-hidden
                      >
                        {i < 2 ? <Icon name="check" size={14} strokeWidth={2.2} /> : null}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-night/60">
                  Preview of {total} items, including sponsor documents where supplied.
                </p>
              </>
            ) : (
              <p className="mt-6 leading-relaxed text-night/75">
                Contact us for the latest checklist. We will tell you what to prepare for your situation.
              </p>
            )}
            <Link href={`/checklists/${slug}`} className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-night underline underline-offset-4">
              Open the full checklist <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <p className="mt-6 text-sm text-ivory-faint">
            Checklists are based on our own reference material, not official government lists. Requirements change, so confirm with
            our team before you apply.
          </p>
        </div>
      </Container>
    </section>
  );
}
