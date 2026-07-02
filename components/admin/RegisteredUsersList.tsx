"use client";

import { useEffect, useState } from "react";
import { normalizeName } from "@/lib/normalize";
import type { RegisteredUser } from "@/lib/types";

interface RegisteredUsersListProps {
  claimedNames: Set<string>;
  refreshKey: number;
  onChanged: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RegisteredUsersList({
  claimedNames,
  refreshKey,
  onChanged,
}: RegisteredUsersListProps) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/users")
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load registered guests");
          setUsers([]);
          return;
        }
        setError("");
        setUsers(data.users ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load registered guests");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(user: RegisteredUser) {
    const hasClaimed = claimedNames.has(normalizeName(user.name));
    const message = hasClaimed
      ? `Remove "${user.name}" from the guest list and delete their wall signature?`
      : `Remove "${user.name}" from the guest list?`;

    if (!window.confirm(message)) return;

    setDeletingId(user.id);
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
      method: "DELETE",
    });
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
        Registered Guests ({users.length})
      </h2>

      {loading ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-cream/60">
          Loading…
        </p>
      ) : error ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-[#e2867a]">
          {error}
        </p>
      ) : users.length === 0 ? (
        <p className="font-[family-name:var(--font-newsreader)] italic text-sm text-cream/60">
          No registered guests yet.
        </p>
      ) : (
        <ul className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {users.map((user) => {
            const claimed = claimedNames.has(normalizeName(user.name));
            return (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 bg-wall/50 rounded px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-newsreader)] text-sm text-cream truncate">
                    {user.name}
                  </p>
                  <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-cream/45">
                    Added {formatDate(user.created_at)}
                    {claimed && (
                      <span className="ml-2 text-gold-bright/80">· Claimed</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === user.id}
                  onClick={() => handleDelete(user)}
                  className="shrink-0 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.08em] uppercase text-[#e2867a] hover:text-[#f0a090] disabled:opacity-50"
                >
                  {deletingId === user.id ? "…" : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
