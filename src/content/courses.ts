/**
 * Language courses. Fees, schedules, duration, levels and accreditation
 * have not been supplied, so none are shown.
 */
export type Course = {
  slug: string;
  name: string;
  /** Short label for the language or test. */
  short: string;
  summary: string;
  body: string[];
  /** Places named in the source content where the language is used. */
  usedIn: string[];
  /** Destination slugs to cross-link. */
  destinations: string[];
};

export const courses: Course[] = [
  {
    slug: "spanish",
    name: "Spanish",
    short: "ES",
    summary: "One of the most widely spoken languages in the world, and useful for Spain and Latin America.",
    body: [
      "Spanish is an official language in many countries and one of the most widely spoken languages in the world.",
      "For people planning to move to Spain or Latin America, Spanish can be helpful in daily life and, for some application routes, required.",
    ],
    usedIn: ["Spain", "Latin America"],
    destinations: [],
  },
  {
    slug: "dutch",
    name: "Dutch",
    short: "NL",
    summary: "The official language of the Netherlands and one of the official languages of Belgium.",
    body: [
      "Dutch is the official language of the Netherlands and one of the official languages of Belgium.",
      "Some immigration routes to these countries ask for Dutch language skills, which may be assessed through a language test.",
    ],
    usedIn: ["The Netherlands", "Belgium"],
    destinations: [],
  },
  {
    slug: "french",
    name: "French",
    short: "FR",
    summary: "Spoken in France, Canada and several African nations, and often needed for French-speaking regions.",
    body: [
      "French is an official language in France, Canada and several African nations.",
      "It is often needed for immigration to French-speaking regions, and tests such as the TEF (Test d'évaluation de français) may be used to assess it.",
    ],
    usedIn: ["France", "Canada", "Several African nations"],
    destinations: ["canada"],
  },
  {
    slug: "ielts",
    name: "IELTS",
    short: "EN",
    summary: "A standardised test of English language proficiency used by many immigration routes.",
    body: [
      "IELTS is a standardised test of English language proficiency.",
      "Countries including Australia, Canada, the United Kingdom and New Zealand use IELTS scores in many of their immigration routes.",
    ],
    usedIn: ["Australia", "Canada", "United Kingdom", "New Zealand"],
    destinations: ["australia", "canada", "united-kingdom"],
  },
];

export const courseRequirementsNote =
  "Language requirements vary by destination and by application route, and they can change. Ask us about your plans and we will help you understand what applies to you. Course details are shared on enquiry.";

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}
