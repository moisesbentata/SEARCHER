"use client";

import { useState } from "react";

export function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // The cookie is now set — just reload and the server-rendered
        // page will show the real dashboard.
        window.location.reload();
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const resetAt = body?.resetAt ? new Date(body.resetAt) : null;
        const mins = resetAt
          ? Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 60000))
          : null;
        setError(
          mins
            ? `Too many tries. Locked out for ~${mins} minute${mins === 1 ? "" : "s"}.`
            : "Too many tries. Locked out temporarily.",
        );
      } else if (res.status === 503) {
        setError("Dashboard isn't configured on this environment.");
      } else {
        setError("Wrong password.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-ink-900/[0.03] px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:p-7"
      >
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Enter the dashboard password to continue.
        </p>

        <label className="mt-5 block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ink-500">
            Password
          </span>
          <input
            type="password"
            autoComplete="off"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-base text-ink-900 outline-none focus:border-ink-900/30 focus:ring-2 focus:ring-ink-900/10"
          />
        </label>

        {error ? (
          <div className="mt-3 text-sm text-rose-600">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-xl bg-ink-900 py-3 text-base font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>

        <p className="mt-3 text-[11px] text-ink-500">
          5 attempts per hour per IP, then lockout.
        </p>
      </form>
    </main>
  );
}
