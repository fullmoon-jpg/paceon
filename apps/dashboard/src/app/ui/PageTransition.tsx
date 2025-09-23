"use client";

import React, { useCallback, useState, useEffect } from "react";
import TennisLoader from "./components/TennisLoader";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    initialLoading?: boolean; // show loader immediately
    loadingDuration?: number; // custom loading duration in ms (default 3800)
}

export default function PageTransition({ 
    children, 
    initialLoading = false,
    loadingDuration = 3800 // 3s bounce + 0.8s expand
    }: PageTransitionProps) {
    const [loading, setLoading] = useState<boolean>(initialLoading);
    const [contentReady, setContentReady] = useState<boolean>(!initialLoading);

    // Handle the completion of tennis ball animation
    const handleTennisFinish = useCallback(() => {
        setLoading(false);
        // Small delay before showing content for smooth transition
        setTimeout(() => {
            setContentReady(true);
        }, 200);
    }, []);

    // Auto-start loading process
    useEffect(() => {
        if (initialLoading) {
            setContentReady(false);
            setLoading(true);
        }
    }, [initialLoading]);

    // Method to manually trigger loading (for page transitions)
    const startLoading = useCallback(() => {
        setContentReady(false);
        setLoading(true);
    }, []);

    // Expose global method for easy integration
    useEffect(() => {
        (globalThis as any).__startPageTransition = startLoading;
        (globalThis as any).__isPageLoading = loading;
        
        return () => {
            delete (globalThis as any).__startPageTransition;
            delete (globalThis as any).__isPageLoading;
        };
    }, [startLoading, loading]);

    return (
        <>
        {/* Tennis Ball Loader */}
        <TennisLoader 
            isVisible={loading} 
            onFinish={handleTennisFinish}
            size={120}
        />

        {/* Main Content */}
        <AnimatePresence mode="wait">
            {contentReady && (
                <motion.div
                    key="page-content"
                    initial={{ 
                    opacity: 0, 
                    scale: 0.95,
                    filter: "blur(10px)"
                    }}
                    animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: "blur(0px)"
                    }}
                    exit={{ 
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(5px)"
                    }}
                    transition={{ 
                    duration: 0.6, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    opacity: { duration: 0.4 },
                    filter: { duration: 0.5 }
                    }}
                    className="min-h-screen"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Optional: Preload critical resources during loading */}
        {loading && (
            <div className="sr-only" aria-hidden="true">
                <link rel="preload" as="image" href="/hero-image.jpg" />
                <link rel="preload" as="font" href="/fonts/main-font.woff2" />
            </div>
        )}
        </>
    );
}