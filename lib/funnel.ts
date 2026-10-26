"use client";

// Client-side funnel-stage logger. Writes to /api/analytics/log via a
// fire-and-forget beacon so a slow or failing endpoint can never block
// a UI transition. Safe no-op on the server.

export type FunnelStage =
  | "LANDING"
  | "SEARCH"
  | "RESULTS_LOAD"
  | "STAGE_OWNER"
  | "STAGE_EMAIL"
  | "LEAD_SUBMIT"
  | "STAGE_PAYMENT"
  | "PAY_CLICK"
  | "PAID";

const SESSION_KEY = "tc_funnel_session";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

function getSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing && existing.length <= 64) return existing;
    const fresh = uuid();
    window.localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return undefined;
  }
}

// In-tab de-dup so React effects firing twice (Strict Mode, re-mounts)
// don't log the same stage twice for one page load.
const firedThisPage = new Set<string>();

export function logStage(
  stage: FunnelStage,
  extras?: { email?: string; kind?: string },
): void {
  if (typeof window === "undefined") return;
  const key = `${stage}|${window.location.pathname}`;
  if (firedThisPage.has(key)) return;
  firedThisPage.add(key);

  const sessionId = getSessionId();
  const body = JSON.stringify({
    stage,
    sessionId,
    email: extras?.email,
    kind: extras?.kind,
    path: window.location.pathname,
  });

  try {
    void fetch("/api/analytics/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* best effort */
  }
}
