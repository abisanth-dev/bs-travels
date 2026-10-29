import type { NextConfig } from "next";

/**
 * Old WordPress URLs mapped to the new routes with permanent (301)
 * redirects. Theme demo pages (portfolio, case studies, shop) are left to
 * return 404 because they were never BS Travels content.
 */
const legacy: [string, string][] = [
  ["/appionment", "/appointment"],
  ["/career", "/careers"],
  ["/checklist", "/checklists"],
  ["/service/visa-consultancy", "/services/visa-consultancy"],
  ["/service/air-ticketing", "/services/air-ticketing"],
  ["/service/immigration-service", "/services/immigration-support"],
  ["/service/sworn-translation", "/services/sworn-translation"],
  ["/service/tour-packages", "/services/tour-packages"],
  ["/service/visa-extension", "/services/visa-extension"],
  ["/service", "/services"],
  ["/navigating-the-path-to-a-green-card-in-the-usa", "/blog/path-to-a-us-green-card"],
  ["/essential-facts-about-canada-visitor-visa", "/blog/canada-visitor-visa-essentials"],
  ["/testimonials", "/about"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return legacy.flatMap(([from, to]) => [
      { source: from, destination: to, statusCode: 301 as const },
      { source: `${from}/`, destination: to, statusCode: 301 as const },
    ]);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
