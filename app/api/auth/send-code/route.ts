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
    return NextResponse.json(OPAQUE_OK);
  }

  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const result = await issueOtp({
    rawEmail: parsed.email,
    ipAddress: ip,
    userAgent: ua,
  });

  // Opaque: ALL outcomes except mail-infrastructure failure look identical
  // to the client, so an attacker can't tell whether an email is registered,
  // was rate-limited, or was accepted. Mail failure returns a 500 so we see
  // deliverability issues in the UI during dev.
  if (!result.ok && result.reason === "MAIL_FAILED") {
    return NextResponse.json(
      { ok: false, reason: "MAIL_FAILED" },
      { status: 500 },
    );
  }
  return NextResponse.json(OPAQUE_OK);
}
