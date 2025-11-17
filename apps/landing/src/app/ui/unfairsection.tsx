"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const GetToKnowUsSection = () => {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const slides: Slide[] = [
    { id: 1, image: "/images/networking1-1.jpg", alt: "Networking Event" },
    { id: 2, image: "/images/networking1-2.jpg", alt: "Networking Session" },
    { id: 3, image: "/images/game2-1.jpg", alt: "Game Event" },
    { id: 4, image: "/images/game2-2.jpg", alt: "Game Activity" },
    { id: 5, image: "/images/event3-1.jpg", alt: "PACE ON Event" },
    { id: 6, image: "/images/event3-2.jpg", alt: "PACE ON Community" },
  ];

  // Check if section has been viewed before
  useEffect(() => {
    setMounted(true);
    const hasSeenSection = sessionStorage.getItem('get_to_know_viewed');
    if (!hasSeenSection) {
      setShouldAnimate(true);
      sessionStorage.setItem('get_to_know_viewed', 'true');
    }
  }, []);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const isActive = (index: number) => index === active;

  const randomRotateY = () => {
    return mounted ? Math.floor(Math.random() * 21) - 10 : 0;
  };

  // Reduced animation variants for revisit
  const fadeInVariant = {
    hidden: shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  };

  const slideInVariant = {
    hidden: shouldAnimate ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 },
    visible: { opacity: 1, x: 0 }
  };

  const scaleInVariant = {
    hidden: shouldAnimate ? { scale: 0.9, opacity: 0 } : { scale: 1, opacity: 1 },
    visible: { scale: 1, opacity: 1 }
  };

  return (
    <section 
      className="w-full py-12 sm:py-16 md:py-20 lg:py-24" 
      style={{ backgroundColor: '#f4f4ef' }}
      aria-labelledby="get-to-know-heading"
    >
      <div className="max-w-9xl px-6 sm:px-8 lg:px-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <motion.p 
              variants={fadeInVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0 }}
              className="text-sm sm:text-base font-body text-gray-600 mb-3 sm:mb-4"
            >
              Why PACE ON Exists?
            </motion.p>
            
            <motion.h2 
              id="get-to-know-heading"
              variants={fadeInVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0, delay: shouldAnimate ? 0.1 : 0 }}
              className="font-brand text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 sm:mb-6"
            >
              <span className="text-[#3f3e3d]">Redefining Networking for the</span>
              <br />
              <span className="text-[#FB6F7A]">Next Generation.</span>
            </motion.h2>

            <motion.p 
              variants={fadeInVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0, delay: shouldAnimate ? 0.2 : 0 }}
              className="font-body text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed"
            >
              We&apos;re on a mission to make professional connections feel authentic, fun, and meaningful.{" "}
              <strong>PACE ON</strong> brings together Gen-Z founders & decision makers who believe growth happens when work meets play.
            </motion.p>
          </div>

          {/* Right Image Stack Carousel */}
          <motion.div 
            variants={slideInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: shouldAnimate ? 0.7 : 0, ease: "easeOut" }}
            className="order-1 lg:order-2 relative px-4 sm:px-0"
          >
            {/* Image Stack Container */}
            <motion.div 
              variants={scaleInVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? 0.2 : 0 }}
              className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] w-full max-w-md mx-auto lg:max-w-none"
            >
              {mounted && (
                <AnimatePresence mode="sync">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
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
                        zIndex: isActive(index) ? 10 : slides.length + 2 - index,
                        y: isActive(index) ? [0, -80, 0] : 0,
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
                      style={{ pointerEvents: isActive(index) ? 'auto' : 'none' }}
                    >
                      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                          className="object-cover object-center"
                          quality={85}
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          draggable={false}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Fallback static image */}
              {!mounted && (
                <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
                  <Image
                    src={slides[0].image}
                    alt={slides[0].alt}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
              )}
            </motion.div>

            {/* Navigation Arrows */}
            <motion.button
              initial={shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0, delay: shouldAnimate ? 0.4 : 0 }}
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#f0c946] hover:bg-[#f47a49] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#3f3e3d] transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            </motion.button>

            <motion.button
              initial={shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0, delay: shouldAnimate ? 0.4 : 0 }}
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#f0c946] hover:bg-[#f47a49] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
              aria-label="Next slide"
              type="button"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#3f3e3d] transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </motion.button>

            {/* Slide Indicators */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldAnimate ? 0.5 : 0, delay: shouldAnimate ? 0.5 : 0 }}
              className="flex justify-center gap-2 mt-6"
              role="tablist"
              aria-label="Carousel navigation"
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === active ? 'bg-[#3f3e3d] w-8' : 'bg-gray-400 w-2 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === active ? 'true' : 'false'}
                  role="tab"
                  type="button"
                />
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default GetToKnowUsSection;