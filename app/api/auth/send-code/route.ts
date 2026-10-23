import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp } from "@/lib/auth";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().min(3).max(254) });

const OPAQUE_OK = { ok: true as const };

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    // Opaque: return the same shape as success to avoid probing.
    console.warn("[send-code] bad body");
    return NextResponse.json(OPAQUE_OK);
  }

  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const result = await issueOtp({
    rawEmail: parsed.email,
    ipAddress: ip,
    userAgent: ua,
  });

  // Verbose server-side log so Vercel's function logs show the real
  // outcome of every attempt. Client responses stay narrow on purpose.
  if (result.ok) {
    console.log("[send-code] ok", { email: parsed.email, ip });
  } else {
    console.warn("[send-code] not-ok", {
      email: parsed.email,
      ip,
      reason: result.reason,
      detail: "detail" in result ? result.detail : undefined,
      resetAt: "resetAt" in result ? result.resetAt?.toISOString() : undefined,
    });
  }

  // Mail-infrastructure failure: surface as 500 so the dialog shows a
  // real error instead of pretending a code went out.
  if (!result.ok && result.reason === "MAIL_FAILED") {
    return NextResponse.json(
      { ok: false, reason: "MAIL_FAILED" },
      { status: 500 },
    );
  }

  // Rate limit: email-indexed, so surfacing it does not leak whether the
  // address is registered. Hitting the limit silently used to look
  // identical to success, which meant a user who tested the flow a few
  // times stopped getting codes with no explanation.
  if (!result.ok && result.reason === "RATE_LIMITED") {
    return NextResponse.json(
      {
        ok: false,
        reason: "RATE_LIMITED",
        resetAt: result.resetAt.toISOString(),
      },
      { status: 429 },
    );
  }

  return NextResponse.json(OPAQUE_OK);
}
