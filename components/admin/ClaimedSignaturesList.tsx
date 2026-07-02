"use client";

import { useEffect, useState } from "react";
import type { WallSignature } from "@/lib/types";

interface ClaimedSignaturesListProps {
  refreshKey: number;
  onChanged: () => void;
  onSignaturesLoaded?: (signatures: WallSignature[]) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClaimedSignaturesList({
  refreshKey,
  onChanged,
  onSignaturesLoaded,
}: ClaimedSignaturesListProps) {
  const [signatures, setSignatures] = useState<WallSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/signatures")
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load claimed frames");
          setSignatures([]);
          onSignaturesLoaded?.([]);
          return;
        }
        const list = data.signatures ?? [];
        setError("");
        setSignatures(list);
        onSignaturesLoaded?.(list);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load claimed frames");
          onSignaturesLoaded?.([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, onSignaturesLoaded]);

  async function handleDelete(sig: WallSignature) {
    if (
      !window.confirm(
        `Remove "${sig.name}" from the wall? They can sign again if still registered.`
      )
    ) {
      return;
    }

    setDeletingId(sig.id);
    const res = await fetch(
      `/api/admin/signatures?id=${encodeURIComponent(sig.id)}`,
      { method: "DELETE" }
    );
    setDeletingId(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }

    onChanged();
  }

  return (
    <div className="bg-frame-black border border-gold/35 rounded p-6 mb-6">
      <h2 className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.14em] uppercase text-gold-bright mb-4">
        Claimed Frames ({signatures.length})
      </h2>

      {loading ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-cream/60">
          Loading…
        </p>
      ) : error ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-[#e2867a]">
          {error}
        </p>
      ) : signatures.length === 0 ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-cream/60">
          No frames claimed yet.
        </p>
      ) : (
        <ul className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {signatures.map((sig) => (
            <li
              key={sig.id}
              className="flex items-center justify-between gap-3 bg-wall/50 rounded px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-caveat)] text-lg text-gold-bright truncate leading-tight">
                  {sig.name}
                </p>
                <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-cream/45">
                  Signed {formatDate(sig.signed_at)}
                </p>
              </div>
              <button
                type="button"
                disabled={deletingId === sig.id}
                onClick={() => handleDelete(sig)}
                className="shrink-0 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.08em] uppercase text-[#e2867a] hover:text-[#f0a090] disabled:opacity-50"
              >
                {deletingId === sig.id ? "…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
