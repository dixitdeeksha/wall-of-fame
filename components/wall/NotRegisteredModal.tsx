"use client";

import { REGISTRATION_URL } from "@/lib/frames";

interface NotRegisteredModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotRegisteredModal({ open, onClose }: NotRegisteredModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-frame-black border border-gold/35 rounded p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_40px_rgba(247,215,116,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="font-[family-name:var(--font-fraunces)] text-2xl text-cream mb-3"
        >
          You&apos;re not registered yet.
        </h2>
        <p className="font-[family-name:var(--font-newsreader)] italic text-cream/80 mb-2">
          Admire the Wall.
        </p>
        <p className="font-[family-name:var(--font-newsreader)] text-cream/70 mb-6">
          Want your name here?
        </p>
        <a
          href={REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.08em] uppercase bg-gold-bright text-wall px-5 py-3 rounded-sm hover:bg-gold transition-colors"
        >
          Register for Gala
        </a>
        <button
          type="button"
          onClick={onClose}
          className="block w-full mt-4 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.1em] uppercase text-cream/50 hover:text-cream/80"
        >
          Close
        </button>
      </div>
    </div>
  );
}
