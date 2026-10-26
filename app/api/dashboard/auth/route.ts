import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DASHBOARD_COOKIE,
  constantTimeEqualsString,
  expectedToken,
} from "@/lib/dashboard-auth";
import { hitRateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  password: z.string().min(1).max(200),
});

/**
 * Private dashboard login. Rate-limited to 5 attempts per IP per hour
 * so a brute-force sweep can't just hammer every common password. On
 * success we set an HMAC-signed httpOnly cookie that lasts 30 days.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";

  const rl = await hitRateLimit({
    key: `dashboard:ip:${ip}`,
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        reason: "RATE_LIMITED",
        resetAt: rl.resetAt.toISOString(),
      },
      { status: 429 },
    );
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "BAD_REQUEST" }, { status: 400 });
  }

  const expected = process.env.DASHBOARD_PASSWORD ?? "";
  if (!expected) {
    console.warn("[dashboard:auth] DASHBOARD_PASSWORD env var not set");
    return NextResponse.json(
      { ok: false, reason: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  if (!constantTimeEqualsString(parsed.password, expected)) {
    return NextResponse.json(
      { ok: false, reason: "BAD_PASSWORD" },
      { status: 401 },
    );
  }

  const token = expectedToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASHBOARD_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
