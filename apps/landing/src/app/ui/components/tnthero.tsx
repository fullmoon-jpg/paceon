"use client";
import React from "react";
import { ArrowDown, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const TalkNTalesHero = () => {
  const router = useRouter();

  const scrollToForm = () => {
    const formSection = document.getElementById('registration-section');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const goToContact = () => {
    router.push('/contact');
  };

  return (
    <section className="w-full min-h-[30vh] sm:min-h-[28vh] md:min-h-[26vh] lg:min-h-[25vh] flex items-center justify-center bg-[#F47a49] relative overflow-hidden py-6 sm:py-7 md:py-8 lg:py-10">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 sm:right-20 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-white/20 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 sm:left-20 w-24 h-24 bg-gradient-to-r from-white/20 to-yellow-400/20 rounded-full blur-2xl animate-pulse" aria-hidden="true" />

      <div className="w-full px-6 sm:px-8 lg:px-28 text-center relative z-10">
        {/* Yellow Badge with Rotation */}
        <div className="inline-block mb-2 sm:mb-3">
          <div 
            className="relative"
            style={{ transform: 'rotate(-3deg)' }}
          >
            <div 
              className="bg-[#F0C946] px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5"
              aria-hidden="true"
            >
              <span className="font-brand text-sm sm:text-base md:text-lg lg:text-xl text-[#3f3e3d] uppercase tracking-wider">
                Our Movement
              </span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="font-brand text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-2 sm:mb-3 leading-none tracking-tight">
          TALK N TALES
        </h1>
      </div>
    </section>
  );
};

export default TalkNTalesHero;