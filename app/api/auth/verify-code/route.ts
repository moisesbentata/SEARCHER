import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().min(3).max(254),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "BAD_INPUT" }, { status: 400 });
  }

  const result = await verifyOtp({ rawEmail: parsed.email, code: parsed.code });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 400 },
    );
  }

  await createSession({
    accountId: result.accountId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return NextResponse.json({
    ok: true,
    email: result.email,
    createdNewAccount: result.createdNewAccount,
  });
}
