"use client";
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if hero has been seen before in this session
  useEffect(() => {
    const hasSeenHero = sessionStorage.getItem('hero_viewed');
    if (!hasSeenHero) {
      setShouldAnimate(true);
      sessionStorage.setItem('hero_viewed', 'true');
    }
  }, []);

  // Lazy load video & auto pause on scroll
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (isPlaying) {
            video.play().catch(() => {
              // Autoplay blocked, ignore
            });
          }
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [isPlaying]);

  const toggleVideo = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch(() => {
        // Handle error silently
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section 
      className="w-full min-h-screen relative flex flex-col"
      aria-label="Hero section"
    >
      {/* Hero Container */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Video Background - Preload metadata only */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          id="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata" // Only load metadata initially
          poster="/images/hero-poster.jpg" // Add poster image
        >
          <source src="/video/hero-vid.webm" type="video/webm" />
          <source src="/video/hero-vid.mp4" type="video/mp4" /> {/* Fallback */}
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content - Conditional animation */}
        <div className="absolute inset-x-0 bottom-0 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
          <div className="max-w-7xl px-6 sm:px-8 lg:px-28">
            {/* H1 with Different Text Colors */}
            <h1 
              className={`font-brand text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight text-left mb-3 sm:mb-4 ${
                shouldAnimate ? 'hero-fade-in' : 'opacity-100'
              }`}
            >
              <span className="text-[#f47a49]">FUN NETWORKING</span>{" "}
              <span className="text-[#f4f4ef]">&</span>{" "}
              <span className="text-[#FB6F7A]">COLLABORATION SPACE</span>{" "}
              <span className="text-[#f4f4ef]">FOR GEN-Z FOUNDERS & DECISION MAKERS</span>
            </h1>

            {/* Description - Conditional animation */}
            <p 
              className={`text-[#f4f4ef]/80 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed text-left font-body ${
                shouldAnimate ? 'hero-fade-in animation-delay-200' : 'opacity-100'
              }`}
            >
              Meet Gen-Z founders & decision makers who believe connections should feel
              natural, not transactional. We turn casual hangs into real opportunities.
            </p>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={toggleVideo}
          className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-[#f4f4ef]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          type="button"
        >
          {isPlaying ? (
            <Pause size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
          ) : (
            <Play size={20} className="ml-1 sm:w-6 sm:h-6" aria-hidden="true" />
          )}
        </button>

        {/* Decorative Gradients - Only animate on first visit */}
        <div 
          className={`absolute top-20 right-10 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl ${
            shouldAnimate ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
        <div 
          className={`absolute bottom-32 left-10 sm:left-20 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl ${
            shouldAnimate ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
      </div>
    </section>
  );
};

export default HeroSection;