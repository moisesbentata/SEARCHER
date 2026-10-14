import { NextResponse } from "next/server";
import { z } from "zod";
import { sendCapiEvent, isMetaConfigured, type MetaEventName } from "@/lib/meta";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  event_name: z.string(),
  event_id: z.string().min(1),
  event_time: z.number().int().optional(),
  event_source_url: z.string().url().optional(),
  user: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      fbp: z.string().optional(),
      fbc: z.string().optional(),
      external_id: z.string().optional(),
    })
    .default({}),
  custom: z
    .object({
      value: z.number().optional(),
      currency: z.string().optional(),
      content_name: z.string().optional(),
      content_category: z.string().optional(),
      content_ids: z.array(z.string()).optional(),
      search_string: z.string().optional(),
    })
    .optional(),
});

const ALLOWED_EVENTS: MetaEventName[] = [
  "PageView",
  "Search",
  "Lead",
  "InitiateCheckout",
  "AddPaymentInfo",
  "StartTrial",
  "Purchase",
  "Subscribe",
  "CompleteRegistration",
];

export async function POST(req: Request) {
  if (!isMetaConfigured()) {
    // Dormant until env vars arrive. Return 200 so client fire-and-forget
    // calls don't log noisy errors.
    return NextResponse.json({ ok: false, error: "not_configured" });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "bad_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const event_name = parsed.data.event_name as MetaEventName;
  if (!ALLOWED_EVENTS.includes(event_name)) {
    return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
  }

  const h = headers();
  const forwardedFor = h.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || undefined;
  const ua = h.get("user-agent") ?? undefined;

  const result = await sendCapiEvent({
    event_name,
    event_id: parsed.data.event_id,
    event_time: parsed.data.event_time,
    event_source_url: parsed.data.event_source_url,
    action_source: "website",
    user_data: {
      ...parsed.data.user,
      client_ip_address: ip,
      client_user_agent: ua,
    },
    custom_data: parsed.data.custom,
  });

  return NextResponse.json(result);
}
