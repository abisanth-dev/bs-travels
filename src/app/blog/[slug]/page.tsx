import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/layout/CtaBand";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { getArticle, publishedArticles } from "@/content/articles";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return publishedArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return pageMetadata({
    title: a.title,
    description: a.excerpt,
    path: `/blog/${a.slug}`,
    type: "article",
    image: a.image?.src,
    noindex: a.status !== "published",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const date = new Date(`${a.publishedAt}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <>
      <PageHero
        eyebrow={`${a.category} · ${a.status === "published" ? "Article" : "Archive"}`}
        title={a.title}
        lead={a.excerpt}
        crumbs={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/${a.slug}`, label: a.title },
        ]}
        image={a.image}
      />
      <Container className="pb-20">
        <article className="mx-auto max-w-2xl">
          <p className="text-sm text-ivory-faint">
            By {a.author} · First published <time dateTime={a.publishedAt}>{date}</time>
          </p>
          {a.status === "archive-review" ? (
            <div role="note" className="mt-8 flex gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-5 text-sm leading-relaxed text-ivory-dim">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-gold" />
              <p>
                This is an archived article from {date}, kept for reference while our team reviews it. Immigration and visa rules
                change often. It is general information, not current guidance, so please confirm the latest requirements with official
                sources or with us.
              </p>
            </div>
          ) : null}
          <div className="prose-bst mt-6 text-lg">
            {a.body.map((b, i) =>
              b.type === "p" ? (
                <p key={i}>{b.text}</p>
              ) : b.type === "h2" ? (
                <h2 key={i}>{b.text}</h2>
              ) : (
                <ul key={i}>
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ),
            )}
          </div>
          {a.relatedDestination ? (
            <Link href={`/destinations/${a.relatedDestination}`} className="mt-12 inline-flex min-h-11 items-center gap-2 text-gold hover:underline">
              Related destination guide <Icon name="arrow-right" size={16} />
            </Link>
          ) : null}
        </article>
      </Container>
      <CtaBand />
    </>
  );
}
