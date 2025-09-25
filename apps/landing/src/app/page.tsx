import HeroSection from "./ui/landingpage";
import PaceNavbar from "./ui/navbar";
import GetToKnowUsSection from "./ui/unfairsection";
import PaceOnSection from "./ui/flowsection";
import dynamic from "next/dynamic";
import FadeInSection from "../../../../packages/ui/FadeIn"; 
import { Analytics } from "@vercel/analytics/next";

const PaceOnCTASection = dynamic(() => import("./ui/CTAsectioon"));
const PaceOnFooter = dynamic(() => import("./ui/footer"));

export default function Home() {
  return (
    <main className="bg-gray-50" id="home">
      <Analytics />
      <header id="PACE.ON Navbar">
        <PaceNavbar />
      </header>

      <section id="hero">
          <HeroSection />
      </section>

      <section id="about-us" className="mt-4 lg:mt-20">
        <FadeInSection id="About Us Section" delay={0.2}>
          <GetToKnowUsSection />
        </FadeInSection>
      </section>

      <section id="user-flow">
        <FadeInSection id="Ready To Go Section" delay={0.4}>
          <PaceOnSection />
        </FadeInSection>
      </section>

      <section id="cta-section" className="mt-4 lg:mt-20 mb-4 lg:mb-20">
        <FadeInSection id="Call to Action" delay={0.2}>
          <PaceOnCTASection />
        </FadeInSection>
      </section>

      <footer id="paceon-footer">
          <PaceOnFooter />
      </footer>
    </main>
  );
}
