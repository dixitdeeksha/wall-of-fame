"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WallSignature } from "@/lib/types";
import { normalizeName, sanitizeName, validateName } from "@/lib/normalize";
import { autosizeSignature, MAX_SIGNATURES, seededRotation } from "@/lib/frames";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createBrowserClient } from "@/lib/supabase/client";
import { HeroSection } from "./HeroSection";
import { StorySection } from "./StorySection";
import { FrameGrid } from "./FrameGrid";
import { ClaimBoxControlled } from "./ClaimBox";
import { NotRegisteredModal } from "./NotRegisteredModal";
import { FlyingSignature } from "@/components/ui/FlyingSignature";

interface WallOfFameProps {
  initialSignatures: WallSignature[];
}

interface FlyingState {
  name: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  fontSize: number;
  rotation: number;
  targetIndex: number;
}

const DEFAULT_HINT =
  "Registered guests only — press enter to claim your frame.";

export function WallOfFame({ initialSignatures }: WallOfFameProps) {
  const [signatures, setSignatures] =
    useState<WallSignature[]>(initialSignatures);
  const [showModal, setShowModal] = useState(false);
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);
  const [sparkleIndex, setSparkleIndex] = useState<number | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [flying, setFlying] = useState<FlyingState | null>(null);
  const [claimName, setClaimName] = useState("");
  const [hint, setHint] = useState(DEFAULT_HINT);
  const [hintError, setHintError] = useState(false);

  const firstEmptyFrameRef = useRef<HTMLDivElement | null>(null);
  const firstEmptyIndexRef = useRef(0);
  const localIdsRef = useRef<Set<string>>(new Set());

  const wallFull = signatures.length >= MAX_SIGNATURES;

  const setClaimHint = useCallback((text: string, error = false) => {
    setHint(text);
    setHintError(error);
  }, []);

  const finalizeFrame = useCallback((index: number) => {
    setPoppingIndex(index);
    setSparkleIndex(index);
    setTimeout(() => setPoppingIndex(null), 650);
    setTimeout(() => setSparkleIndex(null), 900);
  }, []);

  const handleFirstEmptyFrame = useCallback(
    (el: HTMLDivElement | null, index: number) => {
      firstEmptyFrameRef.current = el;
      firstEmptyIndexRef.current = index;
    },
    []
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }
    const supabase = createBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel("wall_signatures_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_signatures" },
        (payload) => {
          const row = payload.new as WallSignature;
          if (localIdsRef.current.has(row.id)) {
            localIdsRef.current.delete(row.id);
            return;
          }
          setSignatures((prev) => {
            if (prev.some((s) => s.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const runFlyAnimation = useCallback(
    (name: string, targetIndex: number) => {
      const frameEl = firstEmptyFrameRef.current;
      const inputEl = document.querySelector<HTMLInputElement>(
        'input[placeholder="Type your name..."]'
      );
      if (!frameEl || !inputEl) {
        setAnimatingIndex(null);
        finalizeFrame(targetIndex);
        return;
      }

      const sigProbe = document.createElement("span");
      sigProbe.className =
        "font-[family-name:var(--font-caveat)] font-bold whitespace-nowrap absolute opacity-0 pointer-events-none";
      sigProbe.textContent = name;
      frameEl.appendChild(sigProbe);
      const fontSize = autosizeSignature(sigProbe, frameEl);
      const sigRect = sigProbe.getBoundingClientRect();
      frameEl.removeChild(sigProbe);

      const inputRect = inputEl.getBoundingClientRect();
      const rotation = seededRotation(targetIndex);

      setFlying({
        name,
        from: {
          x: inputRect.left + 10,
          y: inputRect.top + inputRect.height / 2,
        },
        to: {
          x: sigRect.left + sigRect.width / 2,
          y: sigRect.top + sigRect.height / 2,
        },
        fontSize,
        rotation,
        targetIndex,
      });
    },
    [finalizeFrame]
  );

  const handleSign = async (rawName: string) => {
    const validationError = validateName(rawName);
    if (validationError) {
      setClaimHint(validationError, true);
      return;
    }

    const sanitized = sanitizeName(rawName);
    if (wallFull) {
      setClaimHint("All 100 frames have been claimed.", true);
      return;
    }

    setClaimHint("Verifying — settling into its frame…");

    const res = await fetch("/api/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sanitized }),
    });

    const data = await res.json();

    if (!res.ok) {
      switch (data.error) {
        case "not_registered":
          setShowModal(true);
          setClaimHint("You're not registered for the Gala yet.", true);
          break;
        case "already_signed":
          setClaimHint("You've already claimed your frame.", true);
          break;
        case "wall_full":
          setClaimHint("All 100 frames have been claimed.", true);
          break;
        case "rate_limited":
          setClaimHint("Please wait a few seconds before trying again.", true);
          break;
        case "not_configured":
          setClaimHint(
            data.message ||
              "Database not configured. See .env.local setup in README.",
            true
          );
          break;
        default:
          setClaimHint(
            data.message || "Something went wrong. Please try again.",
            true
          );
      }
      return;
    }

    const sig: WallSignature = data;
    localIdsRef.current.add(sig.id);

    const targetIndex = firstEmptyIndexRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setSignatures((prev) => {
      if (prev.some((s) => normalizeName(s.name) === normalizeName(sig.name)))
        return prev;
      return [...prev, sig];
    });

    if (reduceMotion) {
      finalizeFrame(targetIndex);
      setClaimHint("Your name is on the wall!");
    } else {
      setAnimatingIndex(targetIndex);
      runFlyAnimation(sig.name, targetIndex);
      setClaimHint("Your name is on the wall!");
    }
  };

  return (
    <>
      <section
        className="relative min-h-screen px-5 pt-16 pb-24 sm:pb-[90px]"
        style={{
          background: `
            radial-gradient(70% 50% at 15% 100%, rgba(212,175,55,0.12), transparent 60%),
            radial-gradient(60% 45% at 85% 0%, rgba(247,215,116,0.10), transparent 60%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px),
            linear-gradient(160deg, #1a1a1a 0%, #0F0F0F 65%)
          `,
        }}
      >
        <HeroSection signatureCount={signatures.length} />
        <StorySection />
        <FrameGrid
          signatures={signatures}
          poppingIndex={poppingIndex}
          sparkleIndex={sparkleIndex}
          animatingIndex={animatingIndex}
          onFirstEmptyFrame={handleFirstEmptyFrame}
        />
        <ClaimBoxControlled
          onSubmit={handleSign}
          disabled={wallFull}
          hint={hint}
          isError={hintError}
          name={claimName}
          onNameChange={setClaimName}
          onClear={() => setClaimName("")}
        />
      </section>

      <footer className="text-center py-8 px-5 font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.12em] uppercase text-gold/40">
        Books &amp; Brews · Silver Jubilee Meet Gala &amp; Award Night · Agra
      </footer>

      <NotRegisteredModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />

      {flying && (
        <FlyingSignature
          name={flying.name}
          from={flying.from}
          to={flying.to}
          fontSize={flying.fontSize}
          rotation={flying.rotation}
          onComplete={() => {
            setAnimatingIndex(null);
            finalizeFrame(flying.targetIndex);
            setFlying(null);
          }}
        />
      )}
    </>
  );
}
