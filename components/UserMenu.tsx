"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoginDialog } from "@/components/LoginDialog";

type Me = {
  email: string;
  quota: number;
  used: number;
  remaining: number;
  subscriptionStatus: string;
};

const PENDING_EMAIL_KEY = "tc_pending_email";

function readPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(PENDING_EMAIL_KEY);
    return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function UserMenu() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const body = await res.json();
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

  // Mirror localStorage into state so the pill updates immediately after
  // Stage 3 writes the captured email.
  useEffect(() => {
    setPendingEmail(readPendingEmail());
    function onStorage(e: StorageEvent) {
      if (e.key === PENDING_EMAIL_KEY || e.key === null) {
        setPendingEmail(readPendingEmail());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    try {
      window.localStorage.removeItem(PENDING_EMAIL_KEY);
      setPendingEmail(null);
    } catch {
      /* ignore */
    }
    refresh();
  }

  if (loading) {
    return (
      <div className="hidden h-6 w-20 animate-pulse rounded bg-ink-900/5 sm:block" aria-hidden />
    );
  }

  if (!me) {
    const hasPending = !!pendingEmail;
    const initial = (pendingEmail?.[0] ?? "?").toUpperCase();
    return (
      <>
        {hasPending ? (
          <button
            type="button"
            onClick={() => {
              setAutoSend(true);
              setLoginOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-2 py-1 text-sm font-semibold text-ink-800 hover:border-ink-900/20"
            title={`Verify ${pendingEmail}`}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
              {initial}
            </span>
            <span className="hidden max-w-[180px] truncate sm:inline">{pendingEmail}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAutoSend(false);
              setLoginOpen(true);
            }}
            className="text-sm font-semibold text-ink-700 hover:text-ink-900"
          >
            Sign in
          </button>
        )}
        <LoginDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          initialEmail={pendingEmail ?? undefined}
          autoSend={autoSend}
          onSuccess={() => {
            setLoginOpen(false);
            refresh();
          }}
        />
      </>
    );
  }

  // Logged in — show initials pill with a tiny dropdown.
  const initial = me.email[0]?.toUpperCase() ?? "?";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-2 py-1 text-sm font-semibold text-ink-800 hover:border-ink-900/20"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[180px] truncate sm:inline">{me.email}</span>
      </button>
      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-ink-900/5 bg-white p-2 shadow-lg"
          >
            <div className="px-3 py-2 text-xs text-ink-500">
              <div className="truncate text-ink-900">{me.email}</div>
              <div className="mt-1">
                {me.remaining}/{me.quota} lookups left this cycle
              </div>
              <div className="mt-0.5 capitalize">Status: {me.subscriptionStatus.toLowerCase()}</div>
            </div>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-800 hover:bg-ink-900/5"
              role="menuitem"
            >
              Account & billing
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{ color: "#dc2626" }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-rose-50 active:bg-rose-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
