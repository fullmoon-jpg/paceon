"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GalleryImage {
  id: number;
  image: string;
  alt: string;
}

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

const TalkNTalesGallery = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (galleryImages.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = () => setActiveImage((prev) => (prev + 1) % galleryImages.length);
  const handlePrev = () => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .tnt-gallery-headline {
          font-family: 'Alfa Slab One', serif;
          font-size: clamp(40px, 10vw, 110px);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 0.92;
          /* allow wrapping on small screens */
          white-space: normal;
          word-break: break-word;
        }

        .tnt-gallery-headline-shadow {
          color: #E8C12A;
          -webkit-text-stroke: 5px #E8C12A;
          position: absolute;
          top: 5px;
          left: 5px;
          z-index: 0;
          display: block;
        }

        .tnt-gallery-headline-main {
          color: #fff;
          -webkit-text-stroke: 3px #2B3EBF;
          position: relative;
          z-index: 1;
          display: block;
          paint-order: stroke fill;
        }

        /* Thumbnail grid: fewer cols on mobile */
        .tnt-thumb-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 14px;
        }

        @media (min-width: 640px) {
          .tnt-thumb-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }
      `}</style>

      <section
        id="gallery-section"
        style={{ background: "#2B3EBF", width: "100%" }}
        className="px-6 md:px-10 lg:px-20 py-16 md:py-24"
      >
        {/* Header */}
        <div style={{ marginBottom: "clamp(28px, 5vh, 48px)" }}>

          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                background: "#E8121A",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(9px, 1vw, 11px)",
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                padding: "5px 14px",
                flexShrink: 0,
              }}
            >
              Vol. 1
            </div>
            <div style={{ flex: 1, height: "2px", background: "rgba(232,193,42,0.3)" }} />
          </div>

          {/* Headline — layered */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: "clamp(10px, 2vh, 20px)" }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(40px, 10vw, 110px)",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                lineHeight: 0.92,
                color: "#E8C12A",
                WebkitTextStroke: "5px #E8C12A",
                position: "absolute",
                top: "5px",
                left: "5px",
                zIndex: 0,
                display: "block",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              Our Gallery
            </span>
            <span
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(40px, 10vw, 110px)",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                lineHeight: 0.92,
                color: "#fff",
                WebkitTextStroke: "3px #2B3EBF",
                position: "relative",
                zIndex: 1,
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              Our Gallery
            </span>
          </div>

          <p
            style={{
              fontFamily: "'Shrikhand', serif",
              fontSize: "clamp(13px, 1.8vw, 20px)",
              color: "#E8C12A",
              letterSpacing: "0.04em",
              marginTop: "8px",
            }}
          >
            A Glimpse from Talk n Tales Vol. 1
          </p>
        </div>

        {/* Main carousel */}
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image frame */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                border: "4px solid #E8C12A",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={galleryImages[activeImage].id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Image
                    src={galleryImages[activeImage].image}
                    alt={galleryImages[activeImage].alt}
                    fill
                    className="object-cover"
                    priority={activeImage === 0}
                    sizes="(max-width: 768px) 100vw, 1100px"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Counter */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#E8121A",
                  border: "2px solid #E8C12A",
                  padding: "4px 10px",
                  zIndex: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "clamp(10px, 1.2vw, 13px)",
                    color: "#fff",
                    letterSpacing: "0.1em",
                  }}
                >
                  {String(activeImage + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
                </span>
              </div>

              {/* Nav arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    type="button"
                    aria-label="Previous"
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 20,
                      background: "#E8C12A",
                      border: "none",
                      width: "clamp(36px, 5vw, 44px)",
                      height: "clamp(36px, 5vw, 44px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#E8C12A")}
                  >
                    <ChevronLeft style={{ width: "20px", height: "20px", color: "#2B3EBF" }} />
                  </button>
                  <button
                    onClick={handleNext}
                    type="button"
                    aria-label="Next"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 20,
                      background: "#E8C12A",
                      border: "none",
                      width: "clamp(36px, 5vw, 44px)",
                      height: "clamp(36px, 5vw, 44px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#E8C12A")}
                  >
                    <ChevronRight style={{ width: "20px", height: "20px", color: "#2B3EBF" }} />
                  </button>
                </>
              )}
            </div>

            {/* Progress bars */}
            <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  style={{
                    flex: 1,
                    height: "4px",
                    background: i === activeImage ? "#E8C12A" : "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail grid — 4 cols mobile, 8 cols desktop */}
          <div className="tnt-thumb-grid">
            {galleryImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                type="button"
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  border: i === activeImage ? "3px solid #E8C12A" : "3px solid transparent",
                  opacity: i === activeImage ? 1 : 0.5,
                  transition: "all 0.2s",
                  cursor: "pointer",
                  padding: 0,
                  background: "none",
                }}
                onMouseEnter={(e) => {
                  if (i !== activeImage) e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  if (i !== activeImage) e.currentTarget.style.opacity = "0.5";
                }}
              >
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 12vw"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "clamp(28px, 5vh, 48px)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1, height: "2px", background: "rgba(232,193,42,0.3)" }} />
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(9px, 1vw, 11px)",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              textAlign: "center",
            }}
          >
            Follow us for Vol. 2 updates
          </span>
          <div style={{ flex: 1, height: "2px", background: "rgba(232,193,42,0.3)" }} />
        </div>
      </section>
    </>
  );
};

export default TalkNTalesGallery;