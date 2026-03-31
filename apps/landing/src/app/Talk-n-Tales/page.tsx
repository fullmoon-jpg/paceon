"use client";

import TalkNTalesHero from "../ui/components/tnthero";
import TalkNTalesPosterAndDescription from "../ui/components/tntposter";
import Footer from "../ui/footer";
import FadeInSection from "@paceon/ui/FadeIn";
import TalkNTalesAbout from "../ui/components/tntabout";
import TalkNTalesCTA from "../ui/components/tntcta";
import { Analytics } from "@vercel/analytics/next";
import MentorLineup from "../ui/components/tntlineup";

export default function TalkNTalesPage() {
  return (
    <>
      <Analytics />

      <section
        id="hero-section"
        style={{ position: "sticky", top: 0, zIndex: 0 }}
      >
        <TalkNTalesHero />
      </section>

      <section
        id="about-section"
        style={{ position: "relative", zIndex: 10 }}
      >
        <TalkNTalesAbout />
      </section>

      <section
        id="about-section"
        style={{ position: "relative", zIndex: 10 }}
      >
        <MentorLineup />
      </section>

      <section
        id="poster-section"
        style={{ position: "relative", zIndex: 10 }}
        className="bg-[#f4f4ef]"
      >
        <FadeInSection id="Talk n Tales Poster" delay={0.2}>
          <TalkNTalesPosterAndDescription />
        </FadeInSection>
      </section>
      
      <section id="cta-section" style={{ position: "relative", zIndex: 10 }}>
        <TalkNTalesCTA />
      </section>

      <section
        id="footer-section"
        style={{ position: "relative", zIndex: 10 }}
      >
        <Footer />
      </section>
    </>
  );
}