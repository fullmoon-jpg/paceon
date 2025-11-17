"use client";
import React from "react";
import { ArrowDown } from "lucide-react";

const TalkNTalesHero = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('registration-section');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="w-full h-[50vh] flex items-center justify-center bg-[#F47a49] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 sm:right-20 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-white/20 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 sm:left-20 w-24 h-24 bg-gradient-to-r from-white/20 to-yellow-400/20 rounded-full blur-2xl animate-pulse" aria-hidden="true" />

      <div className="w-full px-6 sm:px-8 lg:px-28 py-8 text-center relative z-10">
        {/* Yellow Badge with Rotation */}
        <div className="inline-block mb-3">
          <div 
            className="relative"
            style={{ transform: 'rotate(-3deg)' }}
          >
            <div 
              className="bg-[#F0C946] px-5 py-2 sm:px-7 sm:py-3"
              aria-hidden="true"
            >
              <span className="font-brand text-base sm:text-lg md:text-xl text-[#3f3e3d] uppercase tracking-wider">
                Upcoming Event
              </span>
            </div>
          </div>
        </div>

        {/* Main Title - Original Size */}
        <h1 className="font-brand text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white mb-4 leading-none tracking-tight">
          TALK N TALES
        </h1>

        {/* Tagline */}
        <p className="font-body text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/95 max-w-3xl mx-auto leading-relaxed font-medium mb-6">
          Start the Spark
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToForm}
          className="inline-flex items-center gap-3 bg-[#F0C946] green-fill text-[#3f3e3d] font-brand text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 uppercase tracking-wide group"
        >
          Register Now
          <ArrowDown className="w-5 h-5 animate-bounce group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default TalkNTalesHero;