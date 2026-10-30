import type { IconName } from "@/components/ui/Icon";

export type ServiceCategory = "visas" | "travel" | "documents";

export type Service = {
  slug: string;
  name: string;
  /** Short line used on cards and menus. */
  summary: string;
  category: ServiceCategory;
  icon: IconName;
  /** Featured services get the large panels on the homepage. */
  featured: boolean;
  intro: string[];
  helpsWith: string[];
  /** Typical reasons people get in touch. Phrased as enquiries, not promises. */
  enquiries: string[];
  /** Slugs from content/checklists.ts */
  relatedChecklists: string[];
  /** Ids from content/faqs.ts */
  faqIds: string[];
  /** Whether the enquiry flow should ask for a destination. */
  asksDestination: boolean;
  /** Old WordPress path, kept for redirects. */
  legacyPath?: string;
};

export const serviceCategories: { id: ServiceCategory; label: string }[] = [
  { id: "visas", label: "Visas and immigration" },
  { id: "travel", label: "Flights and travel" },
  { id: "documents", label: "Documents and delivery" },
];

export const services: Service[] = [
  {
    slug: "visa-consultancy",
    name: "Visa Consultancy",
    summary: "Guidance on visa types, paperwork and interview preparation, from first question to submission.",
    category: "visas",
    icon: "passport",
    featured: true,
    intro: [
      "Visa applications can feel complicated, with forms, supporting documents and rules that differ from one country to the next.",
      "Our consultants explain the options that fit your purpose of travel, help you put your documents in order, and stay with you through each step so nothing is left to guesswork.",
    ],
    helpsWith: [
      "Understanding which visa type matches your reason for travel",
      "Preparing and reviewing your application paperwork",
      "Organising applicant and sponsor documents",
      "Getting ready for a visa interview, where one is required",
      "Questions about requirements as they apply to your situation",
    ],
    enquiries: [
      "Visiting family or friends overseas",
      "Tourist and holiday travel",
      "Business visits and invitations",
      "Understanding what a sponsor needs to provide",
    ],
    relatedChecklists: ["canada", "united-kingdom", "india", "thailand"],
    faqIds: ["visa-consultancy", "visa-timing", "how-to-start"],
    asksDestination: true,
  },
  {
    slug: "air-ticketing",
    name: "Air Ticketing",
    summary: "Flight bookings for planned holidays and urgent trips, with help when plans change.",
    category: "travel",
    icon: "ticket",
    featured: true,
    intro: [
      "Whether you are planning a family holiday months ahead or need to fly at short notice for work, we look for suitable routes and convenient schedules on your behalf.",
      "When plans change, the same team helps you with changes and cancellations, so you have one place to call.",
    ],
    helpsWith: [
      "Finding routes and schedules that suit your plans",
      "Comparing fares for your travel dates",
      "Booking one-way, return and multi-city journeys",
      "Handling changes and cancellations to existing bookings",
    ],
    enquiries: [
      "Last-minute business travel",
      "Holiday and family trips",
      "Travel connected to a visa or relocation",
      "Changing an existing booking",
    ],
    relatedChecklists: [],
    faqIds: ["air-ticketing", "how-to-start"],
    asksDestination: true,
  },
  {
    slug: "immigration-support",
    name: "Immigration Support",
    summary: "Step-by-step help with the paperwork behind work permits, residency and moving abroad.",
    category: "visas",
    icon: "compass",
    featured: true,
    intro: [
      "Moving to a new country involves legal procedures and a great deal of paperwork.",
      "We help you understand the route you are considering, prepare your documents carefully, and keep track of each stage of the process with you.",
    ],
    helpsWith: [
      "Work permit applications",
      "Permanent residency applications",
      "Citizenship processes abroad",
      "Gathering and organising supporting documents",
      "Language courses that can support an application",
    ],
    enquiries: [
      "Exploring options for moving abroad",
      "Preparing documents for an application",
      "Understanding language test requirements for a route",
    ],
    relatedChecklists: [],
    faqIds: ["immigration", "how-to-start"],
    asksDestination: true,
    legacyPath: "/service/immigration-service",
  },
  {
    slug: "sworn-translation",
    name: "Sworn Translation",
    summary: "Certified translation of official documents between Tamil or Sinhala and English.",
    category: "documents",
    icon: "translate",
    featured: false,
    intro: [
      "Official applications often ask for documents in another language. Our sworn translation service translates them accurately and certifies them for official use.",
      "We work with Tamil and Sinhala documents translated to and from English.",
    ],
    helpsWith: [
      "Birth, marriage and other civil certificates",
      "Documents needed for visa and immigration applications",
      "Translations between Tamil or Sinhala and English",
    ],
    enquiries: [
      "Translating certificates for a visa application",
      "Checking which documents need a certified translation",
    ],
    relatedChecklists: ["canada", "united-kingdom"],
    faqIds: ["translation", "translators-certified"],
    asksDestination: false,
  },
  {
    slug: "tour-packages",
    name: "Tour Packages",
    summary: "Holiday itineraries planned around your interests, style and budget.",
    category: "travel",
    icon: "map",
    featured: false,
    intro: [
      "Tell us where you would like to go and how you like to travel, and our planners will shape an itinerary around you.",
      "We do not publish fixed packages on this site. Every plan starts with a conversation, and the details and price are shared with you directly.",
    ],
    helpsWith: [
      "Itineraries built around your interests",
      "Accommodation, sightseeing and activities",
      "Options across a range of travel styles and budgets",
    ],
    enquiries: ["Family holidays", "Cultural and sightseeing trips", "Honeymoons and special occasions"],
    relatedChecklists: ["thailand", "india"],
    faqIds: ["tours", "how-to-start"],
    asksDestination: true,
  },
  {
    slug: "visa-extension",
    name: "Visa Extension",
    summary: "Support with extending your stay while staying within the conditions of your visa.",
    category: "visas",
    icon: "stamp",
    featured: false,
    intro: [
      "If you need to stay longer than planned, we help you understand whether an extension may be possible and what it involves.",
      "Our aim is to make the process clear, keep your application compliant, and give you peace of mind.",
    ],
    helpsWith: [
      "Understanding whether an extension may be an option",
      "Preparing the documents for an extension request",
      "Staying within the conditions of your current visa",
    ],
    enquiries: ["Extending a visit", "Questions about current visa conditions"],
    relatedChecklists: [],
    faqIds: ["visa-timing", "how-to-start"],
    asksDestination: true,
  },
  {
    slug: "international-courier",
    name: "International Courier",
    summary: "Sending documents and parcels overseas, with the focus on safe, on-time delivery.",
    category: "documents",
    icon: "parcel",
    featured: false,
    intro: [
      "Send documents and packages overseas through our international courier service.",
      "Our focus is on getting your items to their destination safely and on time.",
    ],
    helpsWith: ["Sending documents overseas", "Sending parcels to family and friends abroad"],
    enquiries: ["Sending application documents", "Sending a parcel abroad"],
    relatedChecklists: [],
    faqIds: ["courier", "how-to-start"],
    asksDestination: true,
  },
];

export const consultationProcess = [
  {
    title: "Reach out",
    body: "Call, message us on WhatsApp, send an enquiry, or visit our office on Navalar Road in Jaffna.",
  },
  {
    title: "Talk it through",
    body: "We listen to what you need and ask about your plans, your documents and your timing.",
  },
  {
    title: "Understand the process",
    body: "We explain the steps involved and give you a quote before any work begins.",
  },
  {
    title: "Prepare together",
    body: "We help you organise and check your documents and keep in touch as things progress.",
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
