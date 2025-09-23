"use client";

import React from "react";

interface PageTransitionProps {
  children?: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-700">Coming Soon 🚧</h1>
    </div>
  );
}
