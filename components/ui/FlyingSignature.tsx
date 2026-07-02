"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

interface FlyingSignatureProps {
  name: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  fontSize: number;
  rotation: number;
  onComplete: () => void;
}

export function FlyingSignature({
  name,
  from,
  to,
  fontSize,
  rotation,
  onComplete,
}: FlyingSignatureProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
    }
  }, [reduceMotion, onComplete]);

  if (reduceMotion) return null;

  return (
    <motion.div
      className="fixed z-[999] font-[family-name:var(--font-caveat)] font-bold text-gold-bright pointer-events-none whitespace-nowrap drop-shadow-[0_0_10px_rgba(247,215,116,0.6)]"
      initial={{
        left: from.x,
        top: from.y,
        fontSize: 22,
        x: "-50%",
        y: "-50%",
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        left: to.x,
        top: to.y,
        fontSize,
        x: "-50%",
        y: "-50%",
        rotate: rotation,
      }}
      transition={{
        duration: 0.85,
        ease: [0.22, 0.68, 0.24, 1],
      }}
      onAnimationComplete={onComplete}
    >
      {name}
    </motion.div>
  );
}
