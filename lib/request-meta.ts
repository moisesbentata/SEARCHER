import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export function getUserAgent(req: NextRequest): string | null {
  return req.headers.get("user-agent");
}
