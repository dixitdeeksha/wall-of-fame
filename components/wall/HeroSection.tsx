"use client";

import Image from "next/image";

interface HeroSectionProps {
  signatureCount: number;
}

export function HeroSection({ signatureCount }: HeroSectionProps) {
  return (
    <>
      <Image
        src="/logo.jpg"
        alt="Books & Brews"
        width={84}
        height={84}
        className="absolute top-4 left-4 z-[5] w-16 sm:top-[22px] sm:left-[22px] sm:w-[84px] h-auto mix-blend-screen opacity-95 drop-shadow-[0_0_8px_rgba(247,215,116,0.28)]"
        priority
      />
      <div className="text-center max-w-[900px] mx-auto mb-14">
        <h1
          className="font-[family-name:var(--font-fraunces)] font-black uppercase text-[clamp(38px,8vw,90px)] tracking-[0.01em] m-0 text-cream"
          style={{
            textShadow:
              "0 0 6px rgba(255,248,231,0.75), 0 0 22px rgba(247,215,116,0.5), 0 0 60px rgba(247,215,116,0.28)",
          }}
        >
          WALL{" "}
          <span className="relative inline-block px-2 after:content-[''] after:absolute after:left-2 after:right-2 after:-bottom-0.5 after:h-1 after:bg-gold-bright after:rounded-sm after:shadow-[0_0_12px_#F7D774,0_0_24px_rgba(247,215,116,0.6)]">
            OF
          </span>{" "}
          FAME
        </h1>
        <p className="font-[family-name:var(--font-caveat)] font-bold text-[clamp(19px,3.6vw,30px)] text-gold-bright mt-4 -rotate-[1.4deg] animate-tagline-glow">
        Turning quiet readers into legendary ones
        </p>
        <p className="font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.16em] uppercase text-[#c9b691] opacity-65 mt-5">
          <b className="text-gold-bright opacity-100">{signatureCount}</b> frames
          claimed · Silver Jubilee Edition
        </p>
      </div>
    </>
  );
}
