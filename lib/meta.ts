// Meta Pixel + Conversions API helpers.
//
// We fire every funnel event in TWO places:
//   1. Browser Pixel (fbq) — primary.
//   2. Server CAPI (/api/track/meta) — redundant, deduped by event_id.
//
// Dedup lets us keep tracking when iOS Safari / ad-blockers eat the Pixel
// request but the server-side still fires. Both calls MUST share the same
// event_id and timestamp, which is why clients generate the event_id and
// hand it to the server with the hashed PII.

import crypto from "crypto";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN ?? "";
export const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE ?? "";

export function isMetaConfigured(): boolean {
  return !!META_PIXEL_ID && !!META_CAPI_TOKEN;
}

export type MetaEventName =
  | "PageView"
  | "Search"
  | "Lead"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "StartTrial"
  | "Purchase"
  | "Subscribe"
  | "CompleteRegistration";

export interface MetaUserData {
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  firstName?: string;
  lastName?: string;
  external_id?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string; // from _fbp cookie
  fbc?: string; // from _fbc cookie (click id)
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  predicted_ltv?: number;
  num_items?: number;
  search_string?: string;
  status?: string;
}

export interface MetaEvent {
  event_name: MetaEventName;
  event_id: string;
  event_time?: number; // unix seconds
  event_source_url?: string;
  action_source?: "website" | "email" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated" | "business_messaging" | "other";
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
}

function sha256Lower(v: string): string {
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

function normalizePhone(v: string): string {
  // Meta expects E.164 digits-only, no plus.
  return v.replace(/[^0-9]/g, "");
}

export function hashUserData(u: MetaUserData): Record<string, string | string[]> {
  const h: Record<string, string | string[]> = {};
  if (u.email) h.em = sha256Lower(u.email);
  if (u.phone) h.ph = sha256Lower(normalizePhone(u.phone));
  if (u.country) h.country = sha256Lower(u.country);
  if (u.city) h.ct = sha256Lower(u.city);
  if (u.state) h.st = sha256Lower(u.state);
  if (u.zip) h.zp = sha256Lower(u.zip);
  if (u.firstName) h.fn = sha256Lower(u.firstName);
  if (u.lastName) h.ln = sha256Lower(u.lastName);
  if (u.external_id) h.external_id = sha256Lower(u.external_id);
  if (u.client_ip_address) h.client_ip_address = u.client_ip_address;
  if (u.client_user_agent) h.client_user_agent = u.client_user_agent;
  if (u.fbp) h.fbp = u.fbp;
  if (u.fbc) h.fbc = u.fbc;
  return h;
}

// Server-side send to Meta Conversions API.
export async function sendCapiEvent(event: MetaEvent): Promise<{ ok: boolean; error?: string }> {
  if (!isMetaConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.event_name,
        event_id: event.event_id,
        event_time: event.event_time ?? Math.floor(Date.now() / 1000),
        event_source_url: event.event_source_url,
        action_source: event.action_source ?? "website",
        user_data: hashUserData(event.user_data),
        custom_data: event.custom_data,
      },
    ],
  };
  if (META_TEST_EVENT_CODE) body.test_event_code = META_TEST_EVENT_CODE;

  const url = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("[meta:capi] non-2xx", r.status, text.slice(0, 400));
      return { ok: false, error: `http_${r.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[meta:capi] fetch failed", err);
    return { ok: false, error: "fetch_failed" };
  }
}
