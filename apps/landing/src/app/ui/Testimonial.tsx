"use client";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "Satu hal yang menarik bagi teman-teman Founders. Bagi yang kesulitan dalam hal networking atau ingin punya circle yang oke, bisa coba gabung ke komunitas PACE ON.",
    name: "Novan Adrian",
    designation: "Co-founder & CTO Qasir.id",
    src: "/images/novan.png"
  },
  {
    quote: "First time bagi gua, ada acara networking yang formatnya fresh, yaitu ada olahraganya dulu.",
    name: "Fikri Ramadhandi",
    designation: "Founder & CEO Indieworks Creative",
    src: "/images/fikri.png"
  },
  {
    quote: "Buat teman-teman yang baru join bisnis, bisa ikut networking di PACE ON, siapa tau bisa dapet kebutuhan bisnis kalian dari sini.",
    name: "Vito Mulia",
    designation: "CEO Soohara Technologies",
    src: "/images/vito.png"
  }
];

const TestimonialCTASection = ({
  autoplay = true,
}: {
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return mounted ? Math.floor(Math.random() * 21) - 10 : 0;
  };

  const handleDashboardClick = () => {
    window.open('https://app.paceon.id', '_blank', 'noopener,noreferrer');
  };

  const handleTalkNTalesClick = () => {
    window.location.href = '/talk-n-tales';
  };

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 lg:py-28 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">
        
        {/* Mobile: Vertical Flow */}
        <div className="lg:hidden">
          {/* 1. Title: What the Community Says */}
          <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] mb-8">
            What the Community Says
          </h2>

          {/* 2. Testimonial Section */}
          <div className="flex flex-col mb-12">
            {/* Portrait Images Stack */}
            <div className="relative h-44 w-44 mb-6">
              {mounted && (
                <AnimatePresence>
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.src}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: randomRotateY(),
                      }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0.7,
                        scale: isActive(index) ? 1 : 0.95,
                        z: isActive(index) ? 0 : -100,
                        rotate: isActive(index) ? 0 : randomRotateY(),
                        zIndex: isActive(index)
                          ? 40
                          : testimonials.length + 2 - index,
                        y: isActive(index) ? [0, -40, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                        rotate: randomRotateY(),
                      }}
                      transition={{
                        duration: 1.1,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <img
                        src={testimonial.src}
                        alt={testimonial.name}
                        draggable={false}
                        className="h-full w-full rounded-3xl object-cover object-center shadow-2xl"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {!mounted && (
                <div className="h-full w-full rounded-3xl bg-gray-200" />
              )}
            </div>

            <motion.div
              key={active}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="mb-6"
            >
              <h3 className="font-brand text-xl sm:text-2xl text-[#3f3e3d] mb-2">
                {testimonials[active].name}
              </h3>
              <p className="font-body text-sm sm:text-base text-[#3f3e3d] mb-3">
                {testimonials[active].designation}
              </p>
              <p className="font-body text-sm sm:text-base text-[#3f3e3d] leading-relaxed">
                {testimonials[active].quote}
              </p>
            </motion.div>

            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3f3e3d] hover:bg-black/80 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3f3e3d] hover:bg-black/80 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* 3. Title: Ready to Pace On with Yellow Background */}
          <div className="inline-block mb-8">
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
                className="relative font-brand text-2xl sm:text-3xl md:text-4xl text-[#3f3e3d] px-4 py-2 sm:px-6 sm:py-3"
                style={{ zIndex: 1 }}
              >
                Ready to Pace On?
              </h2>
            </div>
          </div>

          {/* 4. CTA Section */}
          <div className="flex flex-col">
            <h3 className="font-brand text-xl sm:text-2xl md:text-3xl text-[#3f3e3d] leading-tight mb-6">
              Join the fun networking movement built for Gen-Z decision makers.
            </h3>

            {/* CTA 1 - Dashboard */}
            <button 
              onClick={handleDashboardClick}
              className="group inline-flex items-center gap-3 bg-[#4169E1] pink-fill text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 w-fit mb-4"
            >
              <span className="uppercase tracking-wide whitespace-nowrap">Go to Your Dashboard</span>
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </button>

            {/* Divider */}
            <div className="w-full h-px bg-[#3f3e3d]/20 mb-4" />

            <div className="mb-4">
              <h4 className="font-brand text-lg sm:text-xl md:text-2xl text-[#3f3e3d] mb-2 uppercase">
                Upcoming Event — Talk n Tales
              </h4>
              <p className="font-body text-xs sm:text-sm text-[#3f3e3d]/80 mb-2">
                An open mic and networking night where ideas meet stories. Limited seats — save yours now.
              </p>
              <p className="font-body text-xs sm:text-sm font-semibold text-[#3f3e3d]">
                Part talkshow, part hangout — 100% PaceOn energy.
              </p>
            </div>

            {/* CTA 2 - Talk n Tales */}
            <button 
              onClick={handleTalkNTalesClick}
              className="group inline-flex items-center gap-3 bg-[#FB6F7A] green-fill text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 w-fit"
            >
              <span className="uppercase tracking-wide whitespace-nowrap">Save Your Seat</span>
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Desktop: Side by Side Grid */}
        <div className="hidden lg:block">
          {/* Top Titles */}
          <div className="grid grid-cols-2 gap-12 lg:gap-16 mb-8">
            <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d]">
              What the Community Says
            </h2>
            
            {/* Yellow Background Title */}
            <div className="inline-block self-start">
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
                  className="relative font-brand text-3xl sm:text-4xl md:text-5xl text-[#3f3e3d] px-4 py-2 sm:px-6 sm:py-3"
                  style={{ zIndex: 1 }}
                >
                  Ready to Pace On?
                </h2>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left: Testimonials */}
            <div className="flex flex-col">
              <div className="relative h-52 w-52 mb-6">
                {mounted && (
                  <AnimatePresence>
                    {testimonials.map((testimonial, index) => (
                      <motion.div
                        key={testimonial.src}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                          z: -100,
                          rotate: randomRotateY(),
                        }}
                        animate={{
                          opacity: isActive(index) ? 1 : 0.7,
                          scale: isActive(index) ? 1 : 0.95,
                          z: isActive(index) ? 0 : -100,
                          rotate: isActive(index) ? 0 : randomRotateY(),
                          zIndex: isActive(index)
                            ? 40
                            : testimonials.length + 2 - index,
                          y: isActive(index) ? [0, -50, 0] : 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          z: 100,
                          rotate: randomRotateY(),
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 origin-bottom"
                      >
                        <img
                          src={testimonial.src}
                          alt={testimonial.name}
                          draggable={false}
                          className="h-full w-full rounded-3xl object-cover object-center shadow-2xl"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {!mounted && (
                  <div className="h-full w-full rounded-3xl bg-gray-200" />
                )}
              </div>

              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="mb-6"
              >
                <h3 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-3">
                  {testimonials[active].name}
                </h3>
                <p className="font-body text-base sm:text-lg text-[#3f3e3d] mb-4">
                  {testimonials[active].designation}
                </p>
                <p className="font-body text-base sm:text-lg text-[#3f3e3d] leading-relaxed">
                  {testimonials[active].quote}
                </p>
              </motion.div>

              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3f3e3d] hover:bg-black/80 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3f3e3d] hover:bg-black/80 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Right: CTA Section */}
            <div className="flex flex-col">
              <h3 className="font-brand text-2xl sm:text-3xl md:text-4xl text-[#3f3e3d] leading-tight mb-8 max-w-2xl">
                Join the fun networking movement built for Gen-Z decision makers.
              </h3>

              {/* CTA 1 - Dashboard */}
              <button 
                onClick={handleDashboardClick}
                className="group inline-flex items-center gap-3 bg-[#4169E1] pink-fill text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 w-fit mb-6"
              >
                <span className="uppercase tracking-wide whitespace-nowrap">Go to Your Dashboard</span>
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </button>

              {/* Divider */}
              <div className="w-full h-px bg-[#3f3e3d] mb-6" />

              <div className="mb-6">
                <h4 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-2 uppercase">
                  Upcoming Event — Talk n Tales
                </h4>
                <p className="font-body text-sm sm:text-base lg:text-lg text-[#3f3e3d]/80 mb-2 leading-relaxed">
                  An open mic and networking night where ideas meet stories. 60 Seats Available. Save yours now!
                </p>
                <p className="font-body text-sm sm:text-base text-[#3f3e3d] font-semibold">
                  Part talkshow, part hangout. 100% PACE ON energy.
                </p>
              </div>

              {/* CTA 2 - Talk n Tales */}
              <button 
                onClick={handleTalkNTalesClick}
                className="group inline-flex items-center gap-3 bg-[#FB6F7A] green-fill text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 w-fit"
              >
                <span className="uppercase tracking-wide whitespace-nowrap">Save Your Seat</span>
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3f3e3d] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialCTASection;