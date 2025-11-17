import HeroSection from "./ui/landingpage";
import PaceNavbar from "./ui/navbar";
import GetToKnowUsSection from "./ui/unfairsection";
import OurCoreVibesSection from "./ui/flowsection";
import dynamic from "next/dynamic";
import FadeInSection from "../../../../packages/ui/FadeIn"; 
import HowWeConnectSection from "./ui/HowWeConnect";
import DashboardSection from "./ui/DashboardFeature";
import TestimonialSection from "./ui/Testimonial";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./ui/footer";


export default function Home() {
  return (
    <main className="bg-[#f4f4ef] relative" id="home">
      <Analytics />
      <header id="PACE.ON Navbar">
        <PaceNavbar />
      </header>

      <section id="hero">
        <HeroSection />
      </section>

      <section id="about-us" className="relative z-10">
        <FadeInSection id="About Us Section" delay={0.2}>
          <GetToKnowUsSection />
        </FadeInSection>
      </section>

      <section id="user-flow" className="relative z-20">
        <OurCoreVibesSection />
      </section>

      <section id="how-to-connect" className="relative z-20">
        <HowWeConnectSection />
      </section>

      {/*
      <section id="dashboard-section" className="relative z-10 bg-[#f0c946]">
        <FadeInSection id="Dashboard Section" delay={0.2}>
          <DashboardSection />
        </FadeInSection>
      </section> */}

      <section id="testimonial-section" className="relative z-10 bg-[#f4f4ef]">
        <FadeInSection id="Testimonial Section" delay={0.2}>
          <TestimonialSection />
        </FadeInSection>
      </section>

      <footer id="paceon-footer" className="relative z-10">
        <Footer />
      </footer>
    </main>
  );
}