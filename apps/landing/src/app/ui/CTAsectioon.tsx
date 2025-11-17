"use client";
import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CTASectionProps {
  backgroundColor?: string;
  dashboardUrl?: string;
}

const CTASection = memo(({ 
  backgroundColor = "#f4f4ef",
  dashboardUrl = "https://app.paceon.id"
}: CTASectionProps) => {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const hasSeenCTA = sessionStorage.getItem('cta_viewed');
    if (!hasSeenCTA) {
      setShouldAnimate(true);
      sessionStorage.setItem('cta_viewed', 'true');
    }
  }, []);

  const handleDashboardClick = () => {
    window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTalkNTalesClick = () => {
    router.push('/talk-n-tales');
  };

  const fadeInVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      className="max-w-9xl py-16 sm:py-20 md:py-24 lg:py-28"
      style={{ backgroundColor }}
      aria-labelledby="cta-heading"
    >
      <div className="w-full px-6 sm:px-8 lg:px-28">
        {/* First CTA Block */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldAnimate ? 0.6 : 0 }}
          className="mb-12 sm:mb-16"
        >
          {/* Flex Container - centered alignment */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Left: Text Content */}
            <div className="flex-1">
              {/* Header with yellow background */}
              <div className="inline-block mb-6 sm:mb-8">
                <div className="relative">
                  <div 
                    className="absolute inset-0 -skew-x-2"
                    style={{ 
                      backgroundColor: '#F0C946',
                      transform: 'skew(-2deg)',
                      zIndex: 0
                    }}
                    aria-hidden="true"
                  />
                  
                  <h2 
                    id="cta-heading"
                    className="relative font-brand text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#3f3e3d] px-4 py-2 sm:px-6 sm:py-3"
                    style={{ zIndex: 1 }}
                  >
                    Ready to Pace On?
                  </h2>
                </div>
              </div>

              <motion.h3
                variants={fadeInVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.1 : 0 }}
                className="font-brand text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#3f3e3d] leading-tight max-w-3xl"
              >
                Join the fun networking movement built for Gen-Z decision makers.
              </motion.h3>
            </div>

            {/* Right: Button - self center for vertical alignment */}
            <div className="flex-shrink-0 self-center pt-0 sm:pt-0 md:pt-0 lg:pt-14">
              <motion.button
                variants={fadeInVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.2 : 0 }}
                onClick={handleDashboardClick}
                className="group relative inline-flex items-center gap-3 bg-[#4169E1] pink-fill text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                aria-label="Go to your dashboard"
                type="button"
              >
                <span className="uppercase tracking-wide whitespace-nowrap">Go to Your Dashboard</span>
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white" 
                    aria-hidden="true"
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Divider Line */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.3 : 0 }}
          className="w-full h-px bg-[#3f3e3d] mb-12 sm:mb-16"
          aria-hidden="true"
        />

        {/* Second CTA Block */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.4 : 0 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Left: Text Content */}
            <div className="flex-1">
              <h3 className="font-brand text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#3f3e3d] mb-4 sm:mb-6 uppercase">
                Upcoming Event — Talk n Tales
              </h3>

              <motion.p
                variants={fadeInVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.5 : 0 }}
                className="font-body text-sm sm:text-base lg:text-lg text-[#3f3e3d]/80 mb-2 leading-relaxed"
              >
                An open mic and networking night where ideas meet stories. 60 Seats Available. Save yours now!
              </motion.p>

              <motion.p
                variants={fadeInVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.6 : 0 }}
                className="font-body text-sm sm:text-base text-[#3f3e3d] font-semibold"
              >
                Part talkshow, part hangout. 100% PACE ON energy.
              </motion.p>
            </div>

            {/* Right: Button - self center for vertical alignment */}
            <div className="flex-shrink-0 self-center">
              <motion.button
                variants={fadeInVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.7 : 0 }}
                onClick={handleTalkNTalesClick}
                className="group relative inline-flex items-center gap-3 bg-[#FB6F7A] green-fill text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                aria-label="Register for Talk n Tales event"
                type="button"
              >
                <span className="uppercase tracking-wide whitespace-nowrap">Save Your Seat</span>
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white" 
                    aria-hidden="true"
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;