/**
 * Verified business settings. Every value here comes from the supplied
 * content document or the owner's brief. Anything not confirmed by the
 * business stays out of this file.
 */
export const site = {
  name: "BS Travels",
  legalName: "BS Travels (Private) Limited",
  tagline: "Travel Smart, Achieve More.",
  concept: "Your journey starts in Jaffna. Your possibilities span the world.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bstravels.ca").replace(/\/$/, ""),
  managingDirector: {
    name: "Lion Tharmalingam Sasikanth",
    postNominals: "MAF, PMAF",
    role: "Managing Director",
    // No genuine portrait is available yet. Set a path in /public to show one.
    portrait: null as string | null,
  },
  address: {
    street: "#338, Navalar Road",
    locality: "Jaffna",
    postalCode: "40000",
    country: "Sri Lanka",
    countryCode: "LK",
    // Approximate centre of Jaffna town, used for the globe origin and map links.
    geo: { lat: 9.6615, lng: 80.0255 },
  },
  phone: { display: "+94 77 4481 790", e164: "+94774481790" },
  whatsapp: { url: "https://wa.me/94774481790", number: "94774481790" },
  email: { primary: "info@bstravels.ca", secondary: "bsconsultancy.jaffna@gmail.com" },
  careersEmail: "bsconsultancy.jaffna@gmail.com",
  hours: {
    summary: "Monday to Friday, 9:00 AM to 5:00 PM. Saturday half day.",
    rows: [
      { days: "Monday to Friday", time: "9:00 AM to 5:00 PM" },
      { days: "Saturday", time: "Half day" },
      { days: "Sunday", time: "Closed" },
    ],
  },
  social: { facebook: "https://web.facebook.com/111358541913122" },
  maps: {
    query: "BS TRAVELS (PVT) LTD, Navalar Rd, Jaffna 40000",
    link: "https://www.google.com/maps/search/?api=1&query=BS+TRAVELS+(PVT)+LTD+Navalar+Rd+Jaffna+40000",
    embed: "https://www.google.com/maps?q=BS+TRAVELS+(PVT)+LTD,+Navalar+Rd,+Jaffna+40000&output=embed",
  },
  /**
   * Brand assets. The logo could not be downloaded in the build environment.
   * Drop the original PNG into /public/brand/ and set `logo` to its path,
   * with its real pixel dimensions, to replace the text wordmark.
   */
  brand: {
    logo: null as null | { src: string; width: number; height: number },
  },
} as const;

export type Site = typeof site;

export function telHref() {
  return `tel:${site.phone.e164}`;
}

export function mailHref(email: string = site.email.primary, subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString().replace(/\+/g, "%20");
  return `mailto:${email}${qs ? `?${qs}` : ""}`;
}

export function whatsappHref(text?: string) {
  return text ? `${site.whatsapp.url}?text=${encodeURIComponent(text)}` : site.whatsapp.url;
}
