"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WallSignature } from "@/lib/types";
import { getColumns, totalFramesNeeded } from "@/lib/frames";
import { Frame } from "./Frame";

interface FrameGridProps {
  signatures: WallSignature[];
  poppingIndex?: number | null;
  sparkleIndex?: number | null;
  animatingIndex?: number | null;
  onFirstEmptyFrame?: (el: HTMLDivElement | null, index: number) => void;
}

export function FrameGrid({
  signatures,
  poppingIndex,
  sparkleIndex,
  animatingIndex,
  onFirstEmptyFrame,
}: FrameGridProps) {
  const [cols, setCols] = useState(8);
  const firstEmptyRef = useRef<HTMLDivElement | null>(null);
  const firstEmptyIndexRef = useRef<number>(-1);

  useEffect(() => {
    const update = () => setCols(getColumns(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const total = useMemo(
    () => totalFramesNeeded(signatures.length, cols),
    [signatures.length, cols]
  );

  const names = useMemo(
    () => signatures.map((s) => s.name),
    [signatures]
  );

  const handleFrameRef = useCallback(
    (index: number, el: HTMLDivElement | null) => {
      if (!names[index] && firstEmptyIndexRef.current === -1) {
        firstEmptyIndexRef.current = index;
        firstEmptyRef.current = el;
        onFirstEmptyFrame?.(el, index);
      }
      if (index === firstEmptyIndexRef.current && el) {
        firstEmptyRef.current = el;
        onFirstEmptyFrame?.(el, index);
      }
    },
    [names, onFirstEmptyFrame]
  );

  useEffect(() => {
    firstEmptyIndexRef.current = -1;
    firstEmptyRef.current = null;
    const emptyIdx = names.findIndex((n) => !n);
    if (emptyIdx >= 0) {
      firstEmptyIndexRef.current = emptyIdx;
    }
  }, [names, total]);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-3.5 gap-y-3 max-w-[1180px] mx-auto">
      {Array.from({ length: total }).map((_, i) => {
        const hasName = Boolean(names[i]);
        const showFilled = hasName && animatingIndex !== i;
        return (
          <Frame
            key={i}
            index={i}
            name={showFilled ? (names[i] ?? null) : null}
            isPopping={poppingIndex === i}
            showSparkle={sparkleIndex === i}
            frameRef={(el) => {
              if (!showFilled) handleFrameRef(i, el);
            }}
          />
        );
      })}
    </div>
  );
}
