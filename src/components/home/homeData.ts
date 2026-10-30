/** Lists shared by homepage sections and their scenes (kept free of three.js so the HTML bundle stays small). */

import { destinations, origin } from "@/content/destinations";
import { distanceKm } from "@/lib/geo";

export const INSPIRATION = [
  "japan",
  "canada",
  "thailand",
  "dubai-uae",
  "united-kingdom",
  "nepal",
  "malaysia",
  "india",
  "vietnam",
  "australia",
  "china",
  "qatar",
  "indonesia",
  "united-states",
];

export const GUIDES = [
  { title: "Document checklists", kicker: "Prepare", href: "/checklists", hue: "#7a5a2c", body: "Reference lists of what to gather, to tick off and print." },
  { title: "Destination guides", kicker: "Explore", href: "/destinations", hue: "#2c5a6a", body: "Ideas for fourteen destinations, and how we can help with each." },
  { title: "Language courses", kicker: "Learn", href: "/courses", hue: "#5a2c4a", body: "Spanish, Dutch, French and IELTS preparation." },
  { title: "Questions answered", kicker: "FAQ", href: "/faq", hue: "#2c3f6a", body: "Straight answers about our services and how to get started." },
];

/** Destination journey stops: Jaffna first, then destinations from nearest to farthest. */
export const JOURNEY = [
  { slug: "jaffna", km: 0 },
  ...destinations
    .map((d) => ({ slug: d.slug, km: Math.round(distanceKm(origin, d.marker) / 100) * 100 }))
    .sort((a, b) => a.km - b.km),
];
