"use client";

import { useEffect, useRef } from "react";
import { autosizeSignature, seededRotation } from "@/lib/frames";

interface FrameProps {
  name: string | null;
  index: number;
  isPopping?: boolean;
  showSparkle?: boolean;
  frameRef?: (el: HTMLDivElement | null) => void;
}

export function Frame({
  name,
  index,
  isPopping,
  showSparkle,
  frameRef,
}: FrameProps) {
  const sigRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filled = Boolean(name);

  useEffect(() => {
    if (!filled || !sigRef.current || !containerRef.current) return;
    autosizeSignature(sigRef.current, containerRef.current);
  }, [filled, name]);

  const setRefs = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    frameRef?.(el);
  };

  return (
    <div
      ref={setRefs}
      data-filled={filled ? "true" : "false"}
      data-index={index}
      className={[
        "aspect-[3/4] bg-frame-black rounded p-2 relative overflow-hidden flex items-center justify-center",
        "shadow-[0_6px_14px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.04)]",
        filled
          ? "shadow-[0_6px_14px_rgba(0,0,0,0.55),0_0_0_1px_rgba(247,215,116,0.55),0_0_18px_rgba(247,215,116,0.32),inset_0_0_0_1px_rgba(247,215,116,0.18)]"
          : "",
        isPopping ? "animate-frame-pop" : "",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-1.5 border rounded-sm pointer-events-none",
          filled
            ? "border-gold-bright/22"
            : "border-gold-bright/10",
        ].join(" ")}
      />
      {showSparkle && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-gold-bright rounded-full animate-ping"
              style={{
                left: `${15 + (i * 11) % 70}%`,
                top: `${20 + (i * 17) % 60}%`,
                animationDelay: `${i * 80}ms`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      )}
      <span
        ref={sigRef}
        className={[
          "font-[family-name:var(--font-caveat)] font-bold leading-none text-center max-w-full whitespace-nowrap text-gold-bright",
          "drop-shadow-[0_0_10px_rgba(247,215,116,0.45)] transition-opacity duration-250",
          filled ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          transform: filled ? `rotate(${seededRotation(index)}deg)` : undefined,
        }}
      >
        {name ?? ""}
      </span>
      <span
        className={[
          "absolute bottom-1 right-2 font-[family-name:var(--font-space-mono)] text-[8px] tracking-[0.05em] text-gold-bright/35 transition-opacity duration-400",
          filled ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        N°{String(index + 1).padStart(3, "0")}
      </span>
    </div>
  );
}
