/**
 * Blog articles. The two existing posts are from November 2023. They are
 * kept as archive content with a notice, set to noindex, and left out of
 * the sitemap until the team reviews them. New posts should use
 * status "published" once checked.
 */
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date of original publication. */
  publishedAt: string;
  author: string;
  status: "published" | "archive-review" | "draft";
  /** Old WordPress path, kept for redirects. */
  legacyPath?: string;
  relatedDestination?: string;
  /** Generated art in /public/images/articles. */
  image?: { src: string; alt: string };
  body: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "path-to-a-us-green-card",
    title: "Navigating the path to a green card in the USA",
    excerpt:
      "An overview of the main routes people use when applying for permanent residence in the United States.",
    category: "Visa",
    publishedAt: "2023-11-20",
    author: "BS Travels",
    status: "archive-review",
    legacyPath: "/navigating-the-path-to-a-green-card-in-the-usa",
    relatedDestination: "united-states",
    image: { src: "/images/articles/green-card.jpg", alt: "Generated illustration of a city skyline at dusk" },
    body: [
      {
        type: "p",
        text: "A green card gives its holder permanent residence in the United States. For many people it is a major step, and the process can feel complex.",
      },
      { type: "h2", text: "The main routes" },
      {
        type: "p",
        text: "When this article was written, the most common routes included:",
      },
      {
        type: "ul",
        items: [
          "Family sponsorship by a relative who is a U.S. citizen or permanent resident",
          "Employment, usually connected to a job offer in the United States",
          "Refugee or asylee status",
          "The Diversity Visa programme, a lottery for people from countries with lower rates of immigration to the U.S.",
        ],
      },
      {
        type: "p",
        text: "Each route has its own eligibility rules, and those rules change over time.",
      },
      { type: "h2", text: "Before you start" },
      {
        type: "p",
        text: "Check the current rules from official U.S. government sources and make sure you meet every requirement before you apply. If you would like help understanding your options and preparing your documents, our team is happy to talk it through with you.",
      },
    ],
  },
  {
    slug: "canada-visitor-visa-essentials",
    title: "Essential facts about the Canada visitor visa",
    excerpt: "What a visitor visa application generally involves, and why it pays to prepare carefully.",
    category: "Visa",
    publishedAt: "2023-11-20",
    author: "BS Travels",
    status: "archive-review",
    legacyPath: "/essential-facts-about-canada-visitor-visa",
    relatedDestination: "canada",
    image: { src: "/images/articles/canada-visitor.jpg", alt: "Generated illustration of mountains and a lake" },
    body: [
      {
        type: "p",
        text: "Canada attracts visitors from all over the world, and for many travellers from Sri Lanka the visitor visa is the first step towards seeing family or exploring the country.",
      },
      { type: "h2", text: "What applicants are generally asked to show" },
      {
        type: "ul",
        items: [
          "A clear purpose for the visit, with an invitation letter where relevant",
          "Enough funds for the stay",
          "Ties to your home country",
          "A valid passport and correctly completed forms",
        ],
      },
      {
        type: "p",
        text: "Additional checks, such as medical or background requirements, can apply depending on your circumstances.",
      },
      { type: "h2", text: "Timing and conditions" },
      {
        type: "p",
        text: "Processing times vary, so it is wise to apply well ahead of your planned travel. Once in Canada, visitors must follow the conditions of their visa and leave on time.",
      },
      {
        type: "p",
        text: "Our Canada document checklist can help you start gathering papers, and our team can help you confirm the current requirements.",
      },
    ],
  },
];

export function publishedArticles() {
  return articles.filter((a) => a.status !== "draft");
}

export function getArticle(slug: string) {
  return publishedArticles().find((a) => a.slug === slug);
}
