"use client";

import { useCallback, useEffect, useState } from "react";

type Me = { email: string } | null;

const PENDING_EMAIL_KEY = "tc_pending_email";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        setMe(body?.account ?? null);
      } else {
        setMe(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSignOut() {
    if (!me || signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setMe(null);
      try {
        window.localStorage.removeItem(PENDING_EMAIL_KEY);
      } catch {
        /* ignore */
      }
      setOpen(false);
    } finally {
      setSigningOut(false);
    }
  }

  const signedIn = !!me && !loading;

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-700"
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-ink-900/5 bg-white p-2 shadow-lg"
          >
            <button
              type="button"
              onClick={signedIn ? handleSignOut : undefined}
              disabled={!signedIn || signingOut}
              aria-disabled={!signedIn}
              title={signedIn ? "Sign out" : "Sign in first to use this"}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                signedIn
                  ? "text-rose-600 hover:bg-rose-50 active:bg-rose-100"
                  : "cursor-not-allowed text-ink-400"
              }`}
              role="menuitem"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
