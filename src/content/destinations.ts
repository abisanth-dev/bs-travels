/**
 * Enquiry destinations. These are places visitors ask BS Travels about,
 * not overseas offices, packages or guaranteed services. Inspiration copy
 * is general travel description only.
 */
export type Region =
  | "south-asia"
  | "southeast-asia"
  | "east-asia"
  | "middle-east"
  | "europe"
  | "north-america"
  | "oceania";

export const regions: { id: Region; label: string }[] = [
  { id: "south-asia", label: "South Asia" },
  { id: "southeast-asia", label: "Southeast Asia" },
  { id: "east-asia", label: "East Asia" },
  { id: "middle-east", label: "Middle East" },
  { id: "europe", label: "Europe" },
  { id: "north-america", label: "North America" },
  { id: "oceania", label: "Oceania" },
];

export type Destination = {
  slug: string;
  /** Display name, e.g. "Canada" or "Dubai, UAE". */
  name: string;
  kind: "country" | "city";
  /** Full country name. For a city this is the country it belongs to. */
  country: string;
  region: Region;
  /** Where the globe marker sits, and what that point is. */
  marker: { lat: number; lng: number; place: string; placeKind: "capital" | "city" };
  headline: string;
  intro: string;
  highlights: string[];
  /** Service slugs worth suggesting for this destination. */
  services: string[];
  /** Checklist slug, if one exists (with or without supplied items). */
  checklist?: string;
  /** Two colours for the art-directed panel when no photograph is set. */
  palette: [string, string];
  /**
   * Licensed photograph in /public, with credit. Left empty until real,
   * licensed images are supplied.
   */
  image?: { src: string; alt: string; credit: string; creditUrl?: string };
};

export const destinations: Destination[] = [
  {
    slug: "canada",
    name: "Canada",
    kind: "country",
    country: "Canada",
    region: "north-america",
    marker: { lat: 45.4215, lng: -75.6972, place: "Ottawa", placeKind: "capital" },
    headline: "Lakes, cities and family reunions",
    intro:
      "From Toronto and Vancouver to the Rocky Mountains, Canada combines vibrant cities with vast, open landscapes. For many families in Jaffna it is also where loved ones now live.",
    highlights: ["Toronto and Niagara Falls", "Vancouver and the Pacific coast", "The Canadian Rockies"],
    services: ["visa-consultancy", "air-ticketing", "sworn-translation", "immigration-support"],
    checklist: "canada",
    palette: ["#1d3b5c", "#b4483c"],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    kind: "country",
    country: "United Kingdom",
    region: "europe",
    marker: { lat: 51.5074, lng: -0.1278, place: "London", placeKind: "capital" },
    headline: "Historic streets and familiar faces",
    intro:
      "London's landmarks, Scotland's highlands and the countryside in between. The UK is a place of history, culture and, for many visitors, family.",
    highlights: ["London", "Edinburgh and the Scottish Highlands", "The English countryside"],
    services: ["visa-consultancy", "air-ticketing", "sworn-translation"],
    checklist: "united-kingdom",
    palette: ["#1c2c4a", "#6d7f99"],
  },
  {
    slug: "india",
    name: "India",
    kind: "country",
    country: "India",
    region: "south-asia",
    marker: { lat: 28.6139, lng: 77.209, place: "New Delhi", placeKind: "capital" },
    headline: "A neighbour of endless variety",
    intro:
      "Temples in Tamil Nadu, the palaces of Rajasthan and the backwaters of Kerala. India is close to home and different in every region.",
    highlights: ["Chennai and Tamil Nadu", "Delhi, Agra and Jaipur", "Kerala"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "india",
    palette: ["#5c2a1d", "#d18a3a"],
  },
  {
    slug: "thailand",
    name: "Thailand",
    kind: "country",
    country: "Thailand",
    region: "southeast-asia",
    marker: { lat: 13.7563, lng: 100.5018, place: "Bangkok", placeKind: "capital" },
    headline: "Golden temples and island light",
    intro:
      "Bangkok's markets and temples, Chiang Mai's hills and the islands of the Andaman Sea. A favourite for holidays and business trips alike.",
    highlights: ["Bangkok", "Chiang Mai", "Phuket and the Andaman coast"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "thailand",
    palette: ["#16424a", "#d9a441"],
  },
  {
    slug: "malaysia",
    name: "Malaysia",
    kind: "country",
    country: "Malaysia",
    region: "southeast-asia",
    marker: { lat: 3.139, lng: 101.6869, place: "Kuala Lumpur", placeKind: "capital" },
    headline: "Skylines, rainforest and island coasts",
    intro:
      "Kuala Lumpur's towers, Penang's heritage streets and the rainforests of Borneo, all within one varied country.",
    highlights: ["Kuala Lumpur", "Penang", "Langkawi"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "malaysia",
    palette: ["#173d36", "#c46b3a"],
  },
  {
    slug: "dubai-uae",
    name: "Dubai, UAE",
    kind: "city",
    country: "United Arab Emirates",
    region: "middle-east",
    marker: { lat: 25.2048, lng: 55.2708, place: "Dubai", placeKind: "city" },
    headline: "A desert city of bold ambition",
    intro:
      "Dubai is a city in the United Arab Emirates, known for its skyline, its desert landscapes and its role as a major travel hub between Asia and the rest of the world.",
    highlights: ["Downtown Dubai", "The desert around the city", "Old Dubai and the Creek"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "dubai-uae",
    palette: ["#3d2a1a", "#d9a45a"],
  },
  {
    slug: "qatar",
    name: "Qatar",
    kind: "country",
    country: "Qatar",
    region: "middle-east",
    marker: { lat: 25.2854, lng: 51.531, place: "Doha", placeKind: "capital" },
    headline: "Gulf waterfronts and modern museums",
    intro:
      "Qatar's capital, Doha, pairs a striking modern skyline with traditional souqs and a long waterfront along the Gulf.",
    highlights: ["Doha Corniche", "Souq Waqif", "The Museum of Islamic Art"],
    services: ["visa-consultancy", "air-ticketing"],
    checklist: "qatar",
    palette: ["#3a1d2a", "#b7795a"],
  },
  {
    slug: "china",
    name: "China",
    kind: "country",
    country: "China",
    region: "east-asia",
    marker: { lat: 39.9042, lng: 116.4074, place: "Beijing", placeKind: "capital" },
    headline: "Ancient walls, modern megacities",
    intro:
      "The Great Wall, Beijing's Forbidden City and Shanghai's waterfront skyline. China spans thousands of years and a vast range of landscapes.",
    highlights: ["Beijing and the Great Wall", "Shanghai", "Guilin and the Li River"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "china",
    palette: ["#4a1a1a", "#c9993f"],
  },
  {
    slug: "japan",
    name: "Japan",
    kind: "country",
    country: "Japan",
    region: "east-asia",
    marker: { lat: 35.6762, lng: 139.6503, place: "Tokyo", placeKind: "capital" },
    headline: "Quiet temples and neon nights",
    intro:
      "Tokyo's energy, Kyoto's temples and gardens, and the shape of Mount Fuji on the horizon. Japan rewards travellers in every season.",
    highlights: ["Tokyo", "Kyoto", "Mount Fuji"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "japan",
    palette: ["#1f2440", "#d97a7a"],
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    kind: "country",
    country: "Vietnam",
    region: "southeast-asia",
    marker: { lat: 21.0278, lng: 105.8342, place: "Hanoi", placeKind: "capital" },
    headline: "Limestone bays and lantern-lit towns",
    intro:
      "From Hanoi's old quarter and Ha Long Bay in the north to Hoi An and Ho Chi Minh City further south, Vietnam unfolds along a long, beautiful coast.",
    highlights: ["Hanoi", "Ha Long Bay", "Hoi An"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "vietnam",
    palette: ["#173a2c", "#c9a44a"],
  },
  {
    slug: "nepal",
    name: "Nepal",
    kind: "country",
    country: "Nepal",
    region: "south-asia",
    marker: { lat: 27.7172, lng: 85.324, place: "Kathmandu", placeKind: "capital" },
    headline: "The roof of the world",
    intro:
      "Kathmandu's temples, Pokhara's lakes and the Himalaya beyond them. Nepal is a destination for pilgrims, trekkers and anyone who loves mountains.",
    highlights: ["Kathmandu Valley", "Pokhara", "The Himalaya"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "nepal",
    palette: ["#1d2d45", "#9fb7c9"],
  },
  {
    slug: "indonesia",
    name: "Indonesia",
    kind: "country",
    country: "Indonesia",
    region: "southeast-asia",
    marker: { lat: -6.2088, lng: 106.8456, place: "Jakarta", placeKind: "capital" },
    headline: "Thousands of islands to explore",
    intro:
      "Bali's rice terraces, the temples of Java and island coastlines without end. Indonesia is an archipelago of remarkable variety.",
    highlights: ["Bali", "Yogyakarta and Borobudur", "Jakarta"],
    services: ["visa-consultancy", "air-ticketing", "tour-packages"],
    checklist: "indonesia",
    palette: ["#14383a", "#c7883e"],
  },
  {
    slug: "united-states",
    name: "United States",
    kind: "country",
    country: "United States of America",
    region: "north-america",
    marker: { lat: 38.9072, lng: -77.0369, place: "Washington, D.C.", placeKind: "capital" },
    headline: "Coast to coast possibilities",
    intro:
      "New York's skyline, California's coast and the national parks between them. The United States is a country of very different places.",
    highlights: ["New York", "California", "The national parks"],
    services: ["visa-consultancy", "air-ticketing", "immigration-support"],
    palette: ["#1b2747", "#a8433f"],
  },
  {
    slug: "australia",
    name: "Australia",
    kind: "country",
    country: "Australia",
    region: "oceania",
    marker: { lat: -35.2809, lng: 149.13, place: "Canberra", placeKind: "capital" },
    headline: "Harbours, reefs and red earth",
    intro:
      "Sydney's harbour, Melbourne's laneways, the Great Barrier Reef and the outback. Australia is a continent of contrasts.",
    highlights: ["Sydney", "Melbourne", "The Great Barrier Reef"],
    services: ["visa-consultancy", "air-ticketing", "immigration-support"],
    palette: ["#16334a", "#c9643a"],
  },
];

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export const origin = {
  name: "Jaffna",
  country: "Sri Lanka",
  lat: 9.6615,
  lng: 80.0255,
};
