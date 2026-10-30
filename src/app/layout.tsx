import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { travelAgencyJsonLd } from "@/lib/seo";
import { fraunces, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Visas, Flights and Travel Support in Jaffna, Sri Lanka`,
    template: `%s | ${site.name}, Jaffna`,
  },
  description:
    "BS Travels (Private) Limited in Jaffna, Sri Lanka: visa consultancy, air ticketing, immigration support, sworn translation, tour packages, visa extension and international courier.",
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a1326",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          {children}
        </main>
        <Footer />
        <div className="grain" aria-hidden />
        <JsonLd data={travelAgencyJsonLd()} />
      </body>
    </html>
  );
}
