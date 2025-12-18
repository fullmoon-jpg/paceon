"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

interface GalleryImage {
  id: number;
  image: string;
  alt: string;
}

const TalkNTalesGallery = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Array of gallery images - landscape orientation
  const galleryImages: GalleryImage[] = [
    { id: 1, image: "/images/tnt-gallery-1.JPG", alt: "Talk n Tales Event Moment 1" },
    { id: 2, image: "/images/tnt-gallery-2.JPG", alt: "Talk n Tales Event Moment 2" },
    { id: 3, image: "/images/tnt-gallery-3.JPG", alt: "Talk n Tales Event Moment 3" },
    { id: 4, image: "/images/tnt-gallery-4.JPG", alt: "Talk n Tales Event Moment 4" },
    { id: 5, image: "/images/tnt-gallery-5.JPG", alt: "Talk n Tales Event Moment 5" },
    { id: 6, image: "/images/tnt-gallery-6.JPG", alt: "Talk n Tales Event Moment 6" },
    { id: 7, image: "/images/tnt-gallery-7.JPG", alt: "Talk n Tales Event Moment 7" },
    { id: 8, image: "/images/tnt-gallery-8.JPG", alt: "Talk n Tales Event Moment 8" },
  ];

  // Auto-play carousel setiap 5 detik, pause on hover
  useEffect(() => {
    if (galleryImages.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % galleryImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryImages.length, isHovered]);

  // Gallery navigation handlers
  const handleNextImage = () => {
    setActiveImage((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section id="gallery-section" className="w-full pt-16 pb-16 sm:pb-20 md:pb-24 lg:pb-28 bg-[#f4f4ef]">
      <div className="w-full px-6 sm:px-8 lg:px-28">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-6 transform -skew-y-1">
            <div className="bg-[#F0C946] px-10 sm:px-12 md:px-16 py-4 sm:py-5">
              <h2 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#3f3e3d] transform skew-y-1">
                OUR GALLERY
              </h2>
            </div>
          </div>
          <p className="font-body text-base sm:text-lg lg:text-xl text-[#3f3e3d]/80 max-w-3xl mx-auto leading-relaxed">
            Relive the memorable moments from our past <strong>Talk n Tales</strong> events
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Main Image Container */}
            <div 
              className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={galleryImages[activeImage].id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={galleryImages[activeImage].image}
                    alt={galleryImages[activeImage].alt}
                    fill
                    className="object-cover"
                    priority={activeImage === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Image Counter Overlay */}
              <div className="absolute top-4 right-4 bg-[#3f3e3d]/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="font-brand text-sm text-white">
                  {activeImage + 1} / {galleryImages.length}
                </p>
              </div>
            </div>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-[#3f3e3d] hover:bg-[#F0C946] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
                  aria-label="Previous image"
                  type="button"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-[#3f3e3d] transition-all duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-[#3f3e3d] hover:bg-[#F0C946] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group"
                  aria-label="Next image"
                  type="button"
                >
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-[#3f3e3d] transition-all duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            <div 
              className="flex justify-center gap-2 mt-8"
              role="tablist"
              aria-label="Gallery navigation"
            >
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === activeImage 
                      ? 'bg-[#F0C946] w-10' 
                      : 'bg-[#3f3e3d]/30 w-2.5 hover:bg-[#3f3e3d]/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === activeImage ? 'true' : 'false'}
                  role="tab"
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Grid (Optional) */}
          <div className="mt-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {galleryImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(index)}
                className={`relative aspect-[16/9] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 ${
                  index === activeImage 
                    ? 'ring-4 ring-[#F0C946] scale-105 shadow-lg' 
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                type="button"
              >
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 12vw"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-12 text-center">
          <p className="font-body text-sm sm:text-base text-[#3f3e3d]/60">
            Follow us on social media to stay updated on our next events! 🚀
          </p>
        </div>

      </div>
    </section>
  );
};

export default TalkNTalesGallery;