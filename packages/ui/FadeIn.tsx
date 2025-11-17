"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { useInView } from "framer-motion";

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  id: string;
}

export default function FadeInSection({ children, delay = 0, id }: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [alreadyAnimated, setAlreadyAnimated] = useState(false);

  useEffect(() => {
    const done = sessionStorage.getItem(`animated-${id}`);
    if (done) {
      setAlreadyAnimated(true);
    }
  }, [id]);

  useEffect(() => {
    if (isInView && !alreadyAnimated) {
      sessionStorage.setItem(`animated-${id}`, "true");
      setAlreadyAnimated(true);
    }
  }, [isInView, alreadyAnimated, id]);

  const shouldAnimate = !alreadyAnimated && isInView;

  return (
    <div
      ref={ref}
      style={{
        transform: shouldAnimate || alreadyAnimated ? 'translateY(0)' : 'translateY(40px)',
        transition: `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}