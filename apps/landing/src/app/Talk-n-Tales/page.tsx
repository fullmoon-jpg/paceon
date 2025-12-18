"use client";

import TalkNTalesHero from "../ui/components/tnthero";
import TalkNTalesPosterAndDescription from "../ui/components/tntposter";
import Footer from "../ui/footer";
import FadeInSection from "@paceon/ui/FadeIn";
import { Analytics } from "@vercel/analytics/next";

export default function TalkNTalesPage() {
  return (
    <>
      <Analytics />

      <section id="hero-section" className="relative z-10">
        <TalkNTalesHero />
      </section>

      <section id="poster-section" className="relative z-10 bg-[#f4f4ef]">
        <FadeInSection id="Talk n Tales Poster" delay={0.2}>
          <TalkNTalesPosterAndDescription />
        </FadeInSection>
      </section>

      <section id="footer-section" className="relative z-10">
        <Footer />
      </section>
    </>
  );
}