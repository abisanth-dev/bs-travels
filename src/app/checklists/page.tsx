import Link from "next/link";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { checklistItemCount, checklistNotice, checklists } from "@/content/checklists";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Visa Document Checklists",
  description: "Document checklists from BS Travels in Jaffna to help you prepare for visa applications. Always confirm current requirements with our team.",
  path: "/checklists",
});

export default function ChecklistsPage() {
  const ready = checklists.filter((c) => c.variants.length);
  const pending = checklists.filter((c) => !c.variants.length);
  return (
    <>
      <PageHero
        eyebrow="Visa document checklists"
        title="Prepare with confidence."
        lead="Choose a destination to open its checklist. Tick items off as you gather them and print the list for your consultation."
        crumbs={[{ href: "/checklists", label: "Checklists" }]}
      />
      <Container className="pb-24">
        <div role="note" className="flex gap-4 rounded-2xl border border-gold/40 bg-gold/5 p-5 text-ivory-dim">
          <Icon name="info" className="mt-0.5 shrink-0 text-gold" />
          <p className="leading-relaxed">{checklistNotice}</p>
        </div>
        <h2 className="font-display mt-16 text-3xl">Checklists available</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {ready.map((c) => (
            <li key={c.slug}>
              <Link href={`/checklists/${c.slug}`} className="group flex min-h-28 items-center justify-between gap-4 rounded-[1.5rem] border border-line-strong bg-navy-2/70 p-6 hover:border-gold">
                <span>
                  <span className="font-display block text-2xl">{c.title}</span>
                  <span className="mt-1 block text-sm text-ivory-dim">
                    {checklistItemCount(c)} items
                    {c.variants.length > 1 ? ` across ${c.variants.length} visa types` : ""}
                    {c.variants.some((v) => v.groups.some((g) => g.id === "sponsor")) ? ", applicant and sponsor" : ""}
                  </span>
                </span>
                <Icon name="arrow-right" className="text-ivory-faint group-hover:text-gold" />
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="font-display mt-16 text-3xl">Contact us for the latest checklist</h2>
        <p className="mt-3 max-w-2xl text-ivory-dim">We have not published lists for these destinations yet. Ask us and we will tell you what to prepare.</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {pending.map((c) => (
            <li key={c.slug}>
              <Link href={`/checklists/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-ivory-dim hover:border-ivory hover:text-ivory">
                {c.title.replace(/ Visa$/, "")}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand title="Want us to check your documents?" body="Bring your checklist to a consultation and our team will go through it with you." enquireHref="/appointment" enquireLabel="Request an Appointment" />
    </>
  );
}
