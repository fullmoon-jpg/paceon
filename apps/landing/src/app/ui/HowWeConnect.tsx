"use client";
import React, { useMemo, useEffect, useState, memo } from "react";
import { motion } from "framer-motion";

interface NetworkStep {
  id: number;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const HowWeConnectSection = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Memoize data
  const networkSteps: NetworkStep[] = useMemo(() => [
    {
      id: 1,
      title: "Come",
      description: "Event-based sessions that break the ice. Sport, coffee chat, Game, you name it.",
      bgColor: "#FB6F7A",
      textColor: "#f4f4ef"
    },
    {
      id: 2,
      title: "Connect",
      description: "Post-event hangouts & curated circles for Gen-Z founders.",
      bgColor: "#f0c946",
      textColor: "#3f3e3d"
    },
    {
      id: 3,
      title: "Collaborate",
      description: "Community projects and collab calls to turn new connections into real actions.",
      bgColor: "#21c36e",
      textColor: "#f4f4ef"
    }
  ], []);

  useEffect(() => {
    const hasSeenConnect = sessionStorage.getItem('how_connect_viewed');
    if (!hasSeenConnect) {
      setShouldAnimate(true);
      sessionStorage.setItem('how_connect_viewed', 'true');
    }
  }, []);

  const headerVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      className="w-full pb-16 sm:pb-20 md:pb-24 lg:pb-28 bg-[#007AA6]"
      aria-labelledby="how-connect-heading"
    >
      <div className="w-full px-6 sm:px-8 lg:px-28">
        {/* Header */}
        <motion.div
          variants={headerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldAnimate ? 0.6 : 0 }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-sm sm:text-base font-body text-[#f4f4ef]/80 mb-2">
            How We Connect?
          </p>
          <h2 
            id="how-connect-heading"
            className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#f4f4ef] mb-6"
          >
            The <span className="text-[#3f3e3d] bg-[#f4f4ef] px-4">Pace <span className="text-[#21c36e]">On</span></span> Way to Network
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[#f4f4ef]/80 max-w-3xl leading-relaxed">
            No suits. No awkward intros. Just real people, real energy. Our events, social vibes, and meaningful conversations to spark collaboration naturally.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {networkSteps.map((step, index) => (
            <NetworkCard 
              key={step.id} 
              step={step} 
              index={index}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Memoized card component
const NetworkCard = memo(({ 
  step, 
  index, 
  shouldAnimate 
}: { 
  step: NetworkStep; 
  index: number;
  shouldAnimate: boolean;
}) => {
  const cardVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.article
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3, margin: "-50px" }}
      transition={{
        duration: shouldAnimate ? 0.6 : 0,
        delay: shouldAnimate ? (index * 0.15) : 0,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-3xl p-8 lg:p-10 cursor-pointer overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
      style={{ 
        backgroundColor: step.bgColor,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      role="article"
      aria-label={`${step.title}: ${step.description}`}
    >
      {/* Content */}
      <div className="relative z-10">
        <h3 
          className="font-brand text-center text-2xl sm:text-3xl lg:text-4xl mb-4 select-none"
          style={{ color: step.textColor }}
        >
          {step.title}
        </h3>
        <p 
          className="font-body text-sm sm:text-base leading-relaxed text-center"
          style={{ color: step.textColor }}
        >
          {step.description}
        </p>
      </div>

      {/* Hover effect - subtle overlay with GPU acceleration */}
      <div 
        className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        aria-hidden="true"
      />

      {/* Decorative gradient (optional enhancement) */}
      <div 
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{
          backgroundColor: step.textColor,
          transform: 'translateZ(0)'
        }}
        aria-hidden="true"
      />
    </motion.article>
  );
});

NetworkCard.displayName = 'NetworkCard';

export default HowWeConnectSection;