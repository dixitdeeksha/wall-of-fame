"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeName } from "@/lib/normalize";
import type { AdminStats } from "@/lib/admin-stats";
import type { WallSignature } from "@/lib/types";
import { RegisteredUsersList } from "./RegisteredUsersList";
import { ClaimedSignaturesList } from "./ClaimedSignaturesList";

export function AdminDashboard({ initialStats }: { initialStats: AdminStats }) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [singleName, setSingleName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [claimedNames, setClaimedNames] = useState<Set<string>>(new Set());
  const router = useRouter();

  const refreshStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (res.ok) setStats(await res.json());
  }, [router]);

  const refreshAll = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refreshStats();
  }, [refreshStats]);

  const handleSignaturesLoaded = useCallback((signatures: WallSignature[]) => {
    setClaimedNames(
      new Set(signatures.map((s) => normalizeName(s.name)))
    );
  }, []);

  async function addUsers(payload: { name?: string; names?: string }) {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Failed to save");
      return;
    }
    setMessage(
      `${data.added} name${data.added === 1 ? "" : "s"} added` +
        (data.duplicates ? ` (${data.duplicates} already on the list)` : "")
    );
    setSingleName("");
    if (payload.names) setBulkNames("");
    refreshAll();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-wall px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-cream">
            Admin Dashboard
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.1em] uppercase text-cream/50 hover:text-cream"
          >
            Log out
          </button>
        </div>

        <div className="bg-frame-black border border-gold/35 rounded p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="Registered Users" value={stats.registeredUsers} />
            <StatCard label="Wall Signatures" value={stats.wallSignatures} />
          </div>
          <p className="font-[family-name:var(--font-space-mono)] text-xs text-cream/70 mb-2">
            Frames Filled: {stats.framesFilled}/{stats.maxFrames}
          </p>
          <div className="h-2 bg-wall rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-bright transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-gold/60 mt-2">
            {stats.completionPercentage}% complete
          </p>
        </div>

        <RegisteredUsersList
          claimedNames={claimedNames}
          refreshKey={refreshKey}
          onChanged={refreshAll}
        />

        <ClaimedSignaturesList
          refreshKey={refreshKey}
          onChanged={refreshAll}
          onSignaturesLoaded={handleSignaturesLoaded}
        />

        <div className="bg-frame-black border border-gold/35 rounded p-6 mb-6">
          <h2 className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.14em] uppercase text-gold-bright mb-4">
            Add Registered User
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (singleName.trim()) addUsers({ name: singleName });
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              placeholder="Full name"
              className="flex-1 bg-wall border border-gold/25 rounded-sm px-3 py-2 text-cream font-[family-name:var(--font-newsreader)] text-sm outline-none focus:border-gold-bright"
            />
            <button
              type="submit"
              disabled={loading}
              className="font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.08em] uppercase bg-gold text-wall px-4 rounded-sm hover:bg-gold-bright disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>

        <div className="bg-frame-black border border-gold/35 rounded p-6">
          <h2 className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.14em] uppercase text-gold-bright mb-1">
            Bulk Upload
          </h2>
          <p className="font-[family-name:var(--font-newsreader)] italic text-xs text-cream/60 mb-4">
            One name per line. Duplicates are skipped.
          </p>
          <textarea
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
            placeholder={"Khushi\nRahul\nAnanya\nDeeksha"}
            className="w-full min-h-[120px] bg-wall border border-gold/25 rounded-sm px-3 py-2 text-cream font-[family-name:var(--font-space-mono)] text-xs outline-none focus:border-gold-bright resize-y"
          />
          <button
            type="button"
            disabled={loading || !bulkNames.trim()}
            onClick={() => addUsers({ names: bulkNames })}
            className="mt-3 font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.08em] uppercase bg-gold text-wall px-4 py-2.5 rounded-sm hover:bg-gold-bright disabled:opacity-50"
          >
            Save all
          </button>
          {message && (
            <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-gold-bright mt-3">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-wall/50 rounded">
      <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.1em] uppercase text-cream/50 mb-1">
        {label}
      </p>
      <p className="font-[family-name:var(--font-fraunces)] text-3xl text-gold-bright">
        {value}
      </p>
    </div>
  );
}
