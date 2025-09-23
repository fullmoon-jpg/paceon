"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface TennisLoaderProps {
    isVisible: boolean;
    onFinish?: () => void;
    size?: number;
    tennisImageUrl?: string;
}

export default function TennisLoader({
    isVisible,
    onFinish,
    size = 120,
    tennisImageUrl = "/images/tennis-ball.png"
    }: TennisLoaderProps) {
    const [imageError, setImageError] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<"bounce" | "handoff">("bounce");
    const [ballStep, setBallStep] = useState<"fall" | "steady" | "handoff">("fall");

    useEffect(() => {
        if (isVisible) {
        // Phase 1: bouncing (2.5s) → steady
        const steadyTimer = setTimeout(() => {
            setBallStep("steady");
            setAnimationPhase("handoff"); // lanjut ke handoff
        }, 2500);

        // Phase 2: selesai setelah handoff (total ~4.2s)
        const finishTimer = setTimeout(() => {
            onFinish?.();
        }, 4200);

        return () => {
            clearTimeout(steadyTimer);
            clearTimeout(finishTimer);
        };
        }
    }, [isVisible, onFinish]);

    // Variants untuk bola
    const ballVariants: Variants = {
        initial: { y: -500, scale: 1 },
        fall: {
        y: [-500, 0, -120, 0, -60, 0], // jatuh + mantul sekali
        scaleX: [1, 1, 1.2, 1, 1.1, 1],
        scaleY: [1, 1, 0.8, 1, 0.9, 1],
        transition: {
            duration: 2.5,
            ease: "easeOut",
            times: [0, 0.35, 0.55, 0.7, 0.85, 1]
        }
        },
        steady: { 
            y: 0, 
            scale: 1,
            transition: { duration: 0.3 }
        },
        handoff: {
            scale: [1, 15, 25],
            y: [0, -50, 0],
            opacity: [1, 0.9, 0],
            transition: {
                duration: 1.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.7, 1]
        }
        }
    };

    // Variants untuk teks
    const textVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delay: 1.2, duration: 0.8, ease: "easeOut" }
        },
        fadeOut: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3, ease: "easeIn" }
        }
    };

    // Variants untuk background
    const backgroundVariants: Variants = {
        initial: { opacity: 1 },
        fadeOut: {
            opacity: 0,
            transition: { duration: 0.8, delay: 0.5 }
        }
    };

    const SVGTennisBall = () => (
        <div
            className="rounded-full flex items-center justify-center"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(ellipse at 30% 30%, #d4ff00 0%, #c2ff00 20%, #9acd32 50%, #7ba400 80%, #6b8e23 100%)`,
                boxShadow: `inset -6px -6px 12px rgba(107, 142, 35, 0.3), inset 6px 6px 12px rgba(255, 255, 255, 0.2)`
            }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <g
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
                >
                    <path d="M15 40 Q30 25, 50 35 Q70 45, 85 30" />
                    <path d="M15 60 Q30 75, 50 65 Q70 55, 85 70" />
                </g>
            </svg>
        </div>
    );

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                key="loader"
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden"
                variants={backgroundVariants}
                initial="initial"
                animate={animationPhase === "handoff" ? "fadeOut" : "initial"}
                >
                    {/* Bola tenis */}
                    <motion.div
                        variants={ballVariants}
                        initial="initial"
                        animate={animationPhase === "bounce" ? ballStep : "handoff"}
                        className="relative z-10"
                    >
                        {!imageError ? (
                        <img
                            src={tennisImageUrl}
                            alt="Tennis Ball"
                            width={size}
                            height={size}
                            className="rounded-full object-cover"
                            onError={() => setImageError(true)}
                        />
                        ) : (
                        <SVGTennisBall />
                        )}
                    </motion.div>

                    {/* Teks loading */}
                    <motion.div
                        className="mt-2 text-2xl font-bold text-gray-800 relative z-10"
                        variants={textVariants}
                        initial="hidden"
                        animate={animationPhase === "handoff" ? "fadeOut" : "visible"}
                    >
                        Loading...
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
