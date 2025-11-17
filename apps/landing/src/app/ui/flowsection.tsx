"use client";
import React, { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CoreVibe {
  id: number;
  number: string;
  title: string;
  description: string;
  shapeColor: string;
  bgColor: string;
  shapeType: "diamond" | "spade" | "heart" | "club";
  phoneColor: string;
}

const OurCoreVibesSection = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Memoize core vibes data
  const coreVibes: CoreVibe[] = useMemo(() => [
    {
      id: 1,
      number: "1",
      title: "Real Connections",
      description: "We build friendships before business. Genuine over formal.",
      shapeColor: "#3f3d3e",
      bgColor: "#F0C946",
      shapeType: "diamond",
      phoneColor: "#21C36E"
    },
    {
      id: 2,
      number: "2",
      title: "Play to Collaborate",
      description: "From fun sessions to creative collabs. Every meet sparks something new.",
      shapeColor: "#21C36E",
      bgColor: "#D2C1F7",
      shapeType: "spade",
      phoneColor: "#d33181"
    },
    {
      id: 3,
      number: "3",
      title: "Grow Together",
      description: "We rise as a community, helping each other move forward.",
      shapeColor: "#d33181",
      bgColor: "#7BA9FF",
      shapeType: "heart",
      phoneColor: "#F47A49"
    },
    {
      id: 4,
      number: "4",
      title: "Stay Authentic",
      description: "No fake vibes here. We keep it real, always.",
      shapeColor: "#F47A49",
      bgColor: "#F4F4EF",
      shapeType: "club",
      phoneColor: "#3f3e3d"
    }
  ], []);

  useEffect(() => {
    const hasSeenCoreVibes = sessionStorage.getItem('core_vibes_viewed');
    if (!hasSeenCoreVibes) {
      setShouldAnimate(true);
      sessionStorage.setItem('core_vibes_viewed', 'true');
    }
  }, []);

  const containerVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  const headerVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      variants={containerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "-100px" }}
      transition={{ 
        duration: shouldAnimate ? 0.8 : 0, 
        ease: [0.22, 1, 0.36, 1]
      }}
      className="w-full h-3/4 bg-[#007AA6] py-16 sm:py-20 md:py-24 lg:py-28"
      style={{
        borderTopLeftRadius: "60px",
        borderTopRightRadius: "60px",
      }}
      aria-labelledby="core-vibes-heading"
    >
      <div className="w-full px-6 sm:px-8 lg:px-28">
        {/* Header */}
        <motion.div
          variants={headerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: shouldAnimate ? 0.7 : 0, 
            delay: shouldAnimate ? 0.3 : 0, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-sm sm:text-base font-body text-[#F4F4EF]/80 mb-2">
            What We Believe In?
          </p>
          <h2 id="core-vibes-heading" className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F4F4EF]">
            Our Core Vibes
          </h2>
        </motion.div>

        {/* Cards Grid - Optimized scroll */}
        <div 
          className="overflow-x-auto pb-4 -mx-6 sm:-mx-8 lg:-mx-28 px-6 sm:px-8 lg:px-28 scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 sm:min-w-max">
            {coreVibes.map((vibe, index) => (
              <CoreVibeCard 
                key={vibe.id} 
                vibe={vibe} 
                index={index}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Memoized card component
const CoreVibeCard = memo(({ 
  vibe, 
  index, 
  shouldAnimate 
}: { 
  vibe: CoreVibe; 
  index: number;
  shouldAnimate: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 40, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <motion.div
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3, margin: "-50px" }}
      transition={{ 
        duration: shouldAnimate ? 0.6 : 0,
        delay: shouldAnimate ? (0.5 + (index * 0.15)) : 0,
        ease: [0.22, 1, 0.36, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="relative rounded-3xl overflow-hidden cursor-pointer touch-manipulation"
      style={{ 
        backgroundColor: vibe.bgColor,
        width: "min(85vw, 400px)",
        height: "min(85vw, 400px)",
        willChange: isHovered ? 'transform' : 'auto'
      }}
      role="article"
      aria-label={`${vibe.title}: ${vibe.description}`}
    >
      {/* Shape with GPU acceleration */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            scale: isHovered ? 8 : 1,
          }}
          transition={{
            duration: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="relative"
          style={{
            width: "60%",
            height: "60%",
            transform: 'translateZ(0)', // GPU acceleration
            backfaceVisibility: 'hidden'
          }}
        >
          <ShapeSVG type={vibe.shapeType} color={vibe.shapeColor} />
        </motion.div>
      </div>

      {/* Number - Always visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.h3
          className="font-brand font-bold select-none"
          style={{ 
            fontSize: "clamp(4rem, 12vw, 7rem)",
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          animate={{
            opacity: isHovered ? 0 : 1,
            color: vibe.shapeColor,
          }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          {vibe.number}
        </motion.h3>
      </div>

      {/* Hover Content */}
      <HoverContent vibe={vibe} isHovered={isHovered} />
    </motion.div>
  );
});

CoreVibeCard.displayName = 'CoreVibeCard';

// Memoized shape SVG component
const ShapeSVG = memo(({ type, color }: { type: string; color: string }) => {
  const shapes = {
    diamond: "M 50 10 L 80 50 L 50 90 L 20 50 Z",
    spade: "M 50 10 C 35 25, 25 35, 25 50 C 25 60, 30 65, 40 65 L 40 80 L 35 85 L 65 85 L 60 80 L 60 65 C 70 65, 75 60, 75 50 C 75 35, 65 25, 50 10 Z",
    heart: "M 50 85 C 50 85, 20 60, 20 40 C 20 25, 30 20, 40 25 C 45 27, 50 32, 50 32 C 50 32, 55 27, 60 25 C 70 20, 80 25, 80 40 C 80 60, 50 85, 50 85 Z",
    club: null
  };

  if (type === "club") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="35" cy="45" r="18" fill={color} />
        <circle cx="65" cy="45" r="18" fill={color} />
        <circle cx="50" cy="30" r="18" fill={color} />
        <path d="M 42 55 L 38 75 L 35 80 L 65 80 L 62 75 L 58 55 Z" fill={color} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d={shapes[type as keyof typeof shapes] || ""} fill={color} />
    </svg>
  );
});

ShapeSVG.displayName = 'ShapeSVG';

// Hover content component
const HoverContent = memo(({ vibe, isHovered }: { vibe: CoreVibe; isHovered: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isHovered ? 1 : 0 }}
    transition={{ duration: 0.3, delay: isHovered ? 0.2 : 0 }}
    className="absolute inset-0 p-6 lg:p-8 z-20 pointer-events-none"
    style={{
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    }}
  >
    <div className="relative h-full flex flex-col">
      {/* Description */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mb-4 max-w-[65%]"
      >
        <p className="font-body text-base lg:text-lg xl:text-xl text-[#F4F4EF] leading-relaxed font-semibold">
          {vibe.description}
        </p>
      </motion.div>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex items-end justify-between">
        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <PhoneMockup title={vibe.title} number={vibe.number} color={vibe.phoneColor} />
        </motion.div>

        {/* Number + Arrow */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-col items-end gap-3"
        >
          <h3 className="font-brand font-bold text-[#F4F4EF] text-5xl lg:text-6xl xl:text-7xl leading-none">
            {vibe.number}
          </h3>
          <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-[#F4F4EF] flex items-center justify-center">
            <ArrowRight 
              className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" 
              style={{ color: vibe.shapeColor }} 
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
));

HoverContent.displayName = 'HoverContent';

// Memoized phone mockup
const PhoneMockup = memo(({ title, number, color }: { title: string; number: string; color: string }) => {
  const getDecorativeElements = useMemo(() => {
    const elements = {
      "1": (
        <div className="flex gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F4F4EF]/40" />
          <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F4F4EF]/20" />
        </div>
      ),
      "2": (
        <div className="flex gap-1">
          <div className="w-3 h-8 sm:w-4 sm:h-10 lg:w-5 lg:h-12 rounded-full bg-[#F4F4EF]/40" />
          <div className="w-3 h-6 sm:w-4 sm:h-8 lg:w-5 lg:h-10 rounded-full bg-[#F4F4EF]/30" />
          <div className="w-3 h-10 sm:w-4 sm:h-12 lg:w-5 lg:h-14 rounded-full bg-[#F4F4EF]/20" />
        </div>
      ),
      "3": (
        <svg width="40" height="40" viewBox="0 0 40 40" className="sm:w-12 sm:h-12 lg:w-14 lg:h-14">
          <path d="M 5 20 L 20 5 L 35 20 L 20 35 Z" fill="white" opacity="0.3" />
        </svg>
      ),
      "4": (
        <div className="flex flex-col gap-1">
          <div className="w-8 h-2 sm:w-10 sm:h-2 lg:w-12 lg:h-3 rounded-full bg-[#F4F4EF]/40" />
          <div className="w-8 h-2 sm:w-10 sm:h-2 lg:w-12 lg:h-3 rounded-full bg-[#F4F4EF]/25" />
          <div className="w-8 h-2 sm:w-10 sm:h-2 lg:w-12 lg:h-3 rounded-full bg-[#F4F4EF]/15" />
        </div>
      ),
    };
    return elements[number as keyof typeof elements] || null;
  }, [number]);

  return (
    <div 
      className="w-28 h-40 sm:w-32 sm:h-44 lg:w-36 lg:h-52 rounded-2xl p-3 sm:p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden select-none"
      style={{
        backgroundColor: color,
        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35), 0 8px 20px rgba(0, 0, 0, 0.25)",
        border: "4px solid rgba(255, 255, 255, 0.5)",
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      role="presentation"
    >
      <div className="flex justify-start">
        {getDecorativeElements}
      </div>

      <div className="text-[#F4F4EF]">
        <h4 className="font-bold text-xs sm:text-sm lg:text-base leading-tight">
          {title}
        </h4>
      </div>

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)'
        }}
        aria-hidden="true"
      />
    </div>
  );
});

PhoneMockup.displayName = 'PhoneMockup';

export default OurCoreVibesSection;