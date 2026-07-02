"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Invalid password");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-wall">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-frame-black border border-gold/35 rounded p-8"
      >
        <h1 className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.14em] uppercase text-gold-bright mb-6 text-center">
          Admin Access
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-wall border border-gold/25 rounded-sm px-3 py-2.5 text-cream font-[family-name:var(--font-space-mono)] text-sm outline-none focus:border-gold-bright mb-4"
          autoFocus
        />
        {error && (
          <p className="text-[#e2867a] text-sm mb-4 font-[family-name:var(--font-newsreader)] italic">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-[family-name:var(--font-space-mono)] text-xs tracking-[0.08em] uppercase bg-gold text-wall py-3 rounded-sm hover:bg-gold-bright disabled:opacity-50"
        >
          {loading ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
