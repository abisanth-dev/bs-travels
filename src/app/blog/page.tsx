import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { publishedArticles } from "@/content/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Articles from BS Travels in Jaffna about visas, travel and moving abroad.",
  path: "/blog",
});

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function BlogPage() {
  const list = publishedArticles();
  const current = list.filter((a) => a.status === "published");
  const archive = list.filter((a) => a.status === "archive-review");
  return (
    <>
      <PageHero eyebrow="Blog" title="Notes for the journey." lead="Articles from our team about visas, travel and moving abroad." crumbs={[{ href: "/blog", label: "Blog" }]} />
      <Container className="pb-24">
        {current.length === 0 ? (
          <p className="max-w-2xl text-lg text-ivory-dim">New articles are on the way. In the meantime, our earlier posts are below.</p>
        ) : null}
        {archive.length ? (
          <section aria-labelledby="archive" className="mt-12">
            <h2 id="archive" className="font-display text-3xl">
              From the archive
            </h2>
            <p className="mt-3 max-w-2xl text-ivory-dim">
              These articles were first published in November 2023 and are being reviewed. Rules may have changed since, so please
              check current requirements with official sources or our team.
            </p>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {archive.map((a) => (
                <li key={a.slug}>
                  <article className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-navy-2/70">
                    {a.image ? (
                      <div className="relative aspect-[16/9]">
                        <Image src={a.image.src} alt={a.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-80" />
                      </div>
                    ) : null}
                    <div className="p-7">
                      <p className="text-xs uppercase tracking-[0.2em] text-ivory-faint">
                        {a.category} · <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time> · Archive
                      </p>
                      <h3 className="font-display mt-3 text-2xl">
                        <Link href={`/blog/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-gold">
                          {a.title}
                        </Link>
                      </h3>
                      <p className="mt-3 text-ivory-dim">{a.excerpt}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </>
  );
}
