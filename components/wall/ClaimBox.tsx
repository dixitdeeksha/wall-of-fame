"use client";

import { useState } from "react";

interface ClaimBoxProps {
  onSubmit: (name: string) => Promise<void>;
  disabled?: boolean;
  hint: string;
  isError: boolean;
}

export function ClaimBoxControlled({
  onSubmit,
  disabled,
  hint,
  isError,
  name,
  onNameChange,
  onClear,
}: ClaimBoxProps & {
  name: string;
  onNameChange: (name: string) => void;
  onClear: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onSubmit(name);
      onClear();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky bottom-0 z-20 pt-4 pb-6 sm:pb-0 sm:static bg-gradient-to-t from-wall via-wall/95 to-transparent sm:bg-none">
      <div className="max-w-[400px] mx-auto mt-8 sm:mt-14 text-center">
        <p className="font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.18em] uppercase text-gold-bright mb-3.5">
          Sign the Wall
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 bg-frame-black border border-gold/30 rounded-sm px-1.5 py-1.5 pl-4"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Type your name..."
            maxLength={50}
            autoComplete="off"
            disabled={loading || disabled}
            className="flex-1 bg-transparent border-none outline-none text-cream font-[family-name:var(--font-newsreader)] text-[17px] py-2.5 placeholder:text-[#8a7a5c] focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
          />
          <button
            type="submit"
            disabled={loading || disabled}
            className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.08em] uppercase bg-gold text-wall border-none rounded-sm px-4 cursor-pointer hover:bg-gold-bright active:scale-[0.96] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "..." : "Claim Your Frame"}
          </button>
        </form>
        <p
          className={[
            "font-[family-name:var(--font-newsreader)] italic text-[13px] mt-3 min-h-4",
            isError ? "text-[#e2867a] opacity-100" : "text-[#cbb98f] opacity-70",
          ].join(" ")}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}
