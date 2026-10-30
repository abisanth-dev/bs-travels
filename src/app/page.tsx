import { AboutSection } from "@/components/home/AboutSection";
import { AppointmentSection } from "@/components/home/AppointmentSection";
import { CoursesSection } from "@/components/home/CoursesSection";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { FlightPath } from "@/components/home/FlightPath";
import { GlobeSection } from "@/components/home/GlobeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeExperience } from "@/components/home/HomeExperience";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { JournalSection } from "@/components/home/JournalSection";
import { PrepareSection } from "@/components/home/PrepareSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { isSubmissionConfigured } from "@/lib/forms/deliver";
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

/** The homepage film: twelve sections, each with its own scene on one shared canvas. */
export default function HomePage() {
  return (
    <HomeExperience>
      <div className="relative">
        <HeroSection />
        <ServicesSection />
        <GlobeSection />
        <DestinationsSection />
        <AboutSection />
        <HowItWorksSection />
        <CoursesSection />
        <PrepareSection />
        <JournalSection />
        <FaqSection />
        <AppointmentSection configured={isSubmissionConfigured()} />
        <FinalCta />
        <FlightPath />
      </div>
    </HomeExperience>
  );
}
