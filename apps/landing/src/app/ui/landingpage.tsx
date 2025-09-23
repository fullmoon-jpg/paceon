"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const HeroSection = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollProgress = Math.min(scrollY / 500, 1);
    const scale = 1 - scrollProgress * 0.1;
    const borderRadius = scrollProgress * 32;

    const toggleVideo = () => {
        const videos = document.querySelectorAll("video");
        videos.forEach((video) => {
        if (isPlaying) video.pause();
        else video.play();
        });
        setIsPlaying(!isPlaying);
    };

    // 🔇 Auto mute
    useEffect(() => {
        const videos = document.querySelectorAll("video");
        videos.forEach((video) => {
        (video as HTMLVideoElement).muted = scrollY > window.innerHeight - 100;
        });
    }, [scrollY]);

    return (
        <div className="w-full">
            {/* Title */}
            <div className="w-full py-10 md:py-10 lg:py-14 flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-24 bg-white">
                <div className="max-w-8xl">
                    <h1 className="text-balance text-3xl md:text-4xl lg:text-5xl xl:text-5xl items-center font-bold text-[#1f4381] leading-tight">
                        Networking Through Sports for Founders & Professionals
                    </h1>
                </div>
            </div>

            {/* Hero Video */}
            <div className="relative w-full h-screen overflow-hidden">
                <div
                className="absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-out"
                style={{
                    transform: `scale(${scale})`,
                    borderRadius: `${borderRadius}px`,
                    transformOrigin: "center center",
                }}
                >
                {/* Video Large */}
                <video
                    className="hidden lg:block w-full h-full object-cover"
                    id="Comming-soon VIdeo Dekstop"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                    borderRadius: `${borderRadius}px`,
                    }}
                >
                    <source src="/video/commingsoon-vid.webm" type="video/webm" />
                </video>

                {/* Video Medium */}
                <video
                    className="hidden md:block lg:hidden w-full h-full object-cover"
                    id="Comming-soon VIdeo Tab"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                    borderRadius: `${borderRadius}px`,
                    }}
                >
                    <source src="/video/commingsoon-tab.webm" type="video/webm" />
                </video>

                {/* Video Small */}
                <video
                    className="block md:hidden w-full h-full object-cover"
                    id="Comming-soon VIdeo Mobile"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                    borderRadius: `${borderRadius}px`,
                    }}
                >
                    <source src="/video/commingsoon-mobile.webm" type="video/webm" />
                </video>
                </div>

                {/* Overlay */}
                <div
                className="absolute inset-0 bg-transparent bg-opacity-30 transition-all duration-300 ease-out"
                style={{
                    transform: `scale(${scale})`,
                    borderRadius: `${borderRadius}px`,
                    transformOrigin: "center center",
                }}
                ></div>

                {/* Controls */}
                <div
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    transform: `scale(${scale})`,
                    borderRadius: `${borderRadius}px`,
                    transformOrigin: "center center",
                }}
                >
                {/* Play / Pause */}
                <div className="absolute bottom-8 right-8">
                    <button
                    onClick={toggleVideo}
                    className="w-12 h-12 bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-black hover:bg-blue-600 transition-all duration-300 border border-black"
                    >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </button>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center text-white/60">
                    <span className="text-sm mb-2">Scroll</span>
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
                    </div>
                    </div>
                </div>
                </div>

                {/* Decorative */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>
        </div>
    );
};

export default HeroSection;
