"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/lib/brand";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (email: string) => void;
  initialEmail?: string;
};

type Stage = "email" | "code" | "success";

export function LoginDialog({ open, onClose, onSuccess, initialEmail }: Props) {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setStage("email");
      setCode("");
      setError(null);
      setLoading(false);
      setResendCooldown(0);
      setTimeout(() => emailInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (stage === "code") {
      setTimeout(() => codeInputRef.current?.focus(), 50);
    }
  }, [stage]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  if (!open) return null;

  async function sendCode(targetEmail: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body?.reason === "MAIL_FAILED") {
          setError("Couldn't send the code just now. Try again in a moment.");
        } else {
          setError("Something went wrong. Try again.");
        }
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("That doesn't look like a valid email.");
      return;
    }
    const ok = await sendCode(normalized);
    if (ok) {
      setStage("code");
      setResendCooldown(30);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        const reason = body?.reason;
        if (reason === "EXPIRED") setError("That code expired. Request a new one.");
        else if (reason === "TOO_MANY_ATTEMPTS") setError("Too many tries. Request a new code.");
        else if (reason === "NO_CODE") setError("No code found for that email. Send one first.");
        else setError("Wrong code. Try again.");
        return;
      }
      setStage("success");
      onSuccess?.(email.trim());
      setTimeout(() => {
        onClose();
      }, 900);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    const ok = await sendCode(email.trim());
    if (ok) setResendCooldown(30);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">{brand.name}</div>
            <h2 id="login-title" className="mt-1 text-xl font-bold text-ink-900">
              {stage === "email" && "Sign in"}
              {stage === "code" && "Check your email"}
              {stage === "success" && "You're in"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {stage === "email" && (
          <form onSubmit={handleEmailSubmit} noValidate>
            <p className="mb-4 text-sm text-ink-600">
              Enter your email. We'll send you a 6-digit code — no password needed.
            </p>
            <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-700">
              Email
            </label>
            <input
              ref={emailInputRef}
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-base text-ink-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
              placeholder="you@example.com"
              disabled={loading}
            />
            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-brand-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        )}

        {stage === "code" && (
          <form onSubmit={handleVerify} noValidate>
            <p className="mb-4 text-sm text-ink-600">
              We sent a 6-digit code to <strong className="text-ink-900">{email}</strong>. It expires in 10 minutes.
            </p>
            <label htmlFor="login-code" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-700">
              Code
            </label>
            <input
              ref={codeInputRef}
              id="login-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-ink-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
              placeholder="000000"
              disabled={loading}
            />
            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-4 w-full rounded-xl bg-brand-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setError(null);
                  setCode("");
                }}
                className="text-ink-600 hover:text-ink-900"
              >
                ← Different email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-brand-700 hover:text-brand-800 disabled:text-ink-400"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {stage === "success" && (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-ink-700">Signed in as <strong>{email}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
