import type { Metadata } from "next";
import { site } from "@/content/site";

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  const images = image ? [{ url: image, width: 1600, height: 1000 }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.name, type, locale: "en_LK", images },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function travelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    slogan: site.tagline,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email.primary,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      postalCode: site.address.postalCode,
      addressCountry: site.address.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.geo.lat, longitude: site.address.geo.lng },
    areaServed: { "@type": "City", name: "Jaffna" },
    // Saturday is a half day with unconfirmed hours, so only weekdays are listed.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    sameAs: [site.social.facebook],
    employee: {
      "@type": "Person",
      name: site.managingDirector.name,
      jobTitle: site.managingDirector.role,
    },
    ...(site.brand.logo ? { logo: `${site.url}${site.brand.logo.src}` } : {}),
  };
}
