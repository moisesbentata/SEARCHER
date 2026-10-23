// Client-side funnel tracking helpers.
//
// Every call fires BOTH the Meta Pixel (fbq) and the server CAPI relay,
// sharing one event_id so Meta can dedupe them.
//
// Safe to call when Meta is not configured — all calls no-op silently.

"use client";

export type FunnelEvent =
  | { type: "PageView" }
  | { type: "Search"; search_string: string; content_category: "phone" | "email" }
  | { type: "Lead"; email: string }
  | { type: "InitiateCheckout"; email: string; value: number; currency: string }
  | { type: "AddPaymentInfo"; email: string; value: number; currency: string }
  | { type: "StartTrial"; email: string; value: number; currency: string }
  | { type: "Purchase"; email: string; value: number; currency: string; transaction_id?: string; event_id?: string }
  | { type: "Subscribe"; email: string; value: number; currency: string };

interface Fbq {
  (cmd: "init", id: string, opts?: Record<string, unknown>): void;
  (cmd: "track", name: string, params?: Record<string, unknown>, meta?: { eventID?: string }): void;
  (cmd: "trackCustom", name: string, params?: Record<string, unknown>): void;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1];
}

function metaConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_META_PIXEL_ID;
}

async function sendCapi(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/track/meta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Best-effort; browser Pixel is the primary signal.
  }
}

export function track(event: FunnelEvent): string {
  // Callers can hand us a deterministic event_id (e.g. the Stripe session
  // id for Purchase) so a server-side CAPI event using the same id dedupes
  // against this client-side one in Meta. Otherwise fall back to a fresh
  // UUID shared between the Pixel call and the CAPI relay below.
  const explicitId = "event_id" in event ? event.event_id : undefined;
  const event_id = explicitId ?? newEventId();
  if (!metaConfigured()) return event_id;

  const url = typeof window !== "undefined" ? window.location.href : undefined;
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");

  // ============== custom_data per event ==============
  let name: string;
  const custom: Record<string, unknown> = {};
  const user: Record<string, string> = {};
  if (fbp) user.fbp = fbp;
  if (fbc) user.fbc = fbc;

  switch (event.type) {
    case "PageView":
      name = "PageView";
      break;
    case "Search":
      name = "Search";
      custom.search_string = event.search_string;
      custom.content_category = event.content_category;
      break;
    case "Lead":
      name = "Lead";
      user.email = event.email;
      break;
    case "InitiateCheckout":
      name = "InitiateCheckout";
      user.email = event.email;
      custom.value = event.value;
      custom.currency = event.currency;
      break;
    case "AddPaymentInfo":
      name = "AddPaymentInfo";
      user.email = event.email;
      custom.value = event.value;
      custom.currency = event.currency;
      break;
    case "StartTrial":
      name = "StartTrial";
      user.email = event.email;
      custom.value = event.value;
      custom.currency = event.currency;
      break;
    case "Purchase":
      name = "Purchase";
      user.email = event.email;
      custom.value = event.value;
      custom.currency = event.currency;
      if (event.transaction_id) custom.content_ids = [event.transaction_id];
      break;
    case "Subscribe":
      name = "Subscribe";
      user.email = event.email;
      custom.value = event.value;
      custom.currency = event.currency;
      break;
  }

  // ============== client-side Pixel ==============
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("track", name, custom, { eventID: event_id });
    } catch {
      /* ignore */
    }
  }

  // ============== server CAPI (dedup by event_id) ==============
  void sendCapi({
    event_name: name,
    event_id,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    user,
    custom,
  });

  return event_id;
}
