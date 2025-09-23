"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";
import { useInView } from "framer-motion";

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  id: string; // kasih ID unik biar bisa disimpen di sessionStorage
}

export default function FadeInSection({ children, delay = 0, id }: FadeInSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [alreadyAnimated, setAlreadyAnimated] = useState(false);

  useEffect(() => {
    // cek apakah section ini udah pernah animasi
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={alreadyAnimated ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
