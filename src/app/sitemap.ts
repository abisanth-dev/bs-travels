import type { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { checklists } from "@/content/checklists";
import { courses } from "@/content/courses";
import { destinations } from "@/content/destinations";
import { services } from "@/content/services";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const fixed = ["", "/about", "/services", "/destinations", "/courses", "/checklists", "/faq", "/blog", "/careers", "/contact", "/appointment", "/enquire"];
  return [
    ...fixed.map((p) => ({ url: u(p), changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: u(`/services/${s.slug}`), priority: 0.8 })),
    ...destinations.map((d) => ({ url: u(`/destinations/${d.slug}`), priority: 0.6 })),
    ...courses.map((c) => ({ url: u(`/courses/${c.slug}`), priority: 0.6 })),
    // Only checklists with supplied items; the others are contact prompts.
    ...checklists.filter((c) => c.variants.length).map((c) => ({ url: u(`/checklists/${c.slug}`), priority: 0.6 })),
    // Archived articles stay out until reviewed.
    ...articles.filter((a) => a.status === "published").map((a) => ({ url: u(`/blog/${a.slug}`), priority: 0.5 })),
  ];
}
