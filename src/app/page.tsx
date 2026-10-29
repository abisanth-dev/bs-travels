import { AboutSection } from "@/components/home/AboutSection";
import { CoursesSection } from "@/components/home/CoursesSection";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { FinalCta } from "@/components/home/FinalCta";
import { FlightPath } from "@/components/home/FlightPath";
import { GlobeSection } from "@/components/home/GlobeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeExperience } from "@/components/home/HomeExperience";
import { PrepareSection } from "@/components/home/PrepareSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "BS Travels | Visas, Flights and Travel Support in Jaffna, Sri Lanka",
    description:
      "Your journey starts in Jaffna. BS Travels helps with visa consultancy, air tickets, immigration support, sworn translation, tours, visa extension and international courier.",
    path: "/",
  }),
  title: { absolute: "BS Travels | Visas, Flights and Travel Support in Jaffna, Sri Lanka" },
};

export default function HomePage() {
  return (
    <HomeExperience>
      <div className="relative">
        <HeroSection />
        <ServicesSection />
        <GlobeSection />
        <AboutSection />
        <DestinationsSection />
        <CoursesSection />
        <PrepareSection />
        <FinalCta />
        <FlightPath />
      </div>
    </HomeExperience>
  );
}
