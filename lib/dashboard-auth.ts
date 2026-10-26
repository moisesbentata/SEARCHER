import crypto from "crypto";

// Private-dashboard auth. We don't want the dashboard behind the OTP
// login flow — Moises just wants a password prompt. The password is
// stored server-side only (env var DASHBOARD_PASSWORD). On success we
// set an HMAC-signed cookie so repeat visits don't re-prompt.
//
// Cookie value = hex HMAC-SHA256("tc-dashboard-v1", DASHBOARD_SECRET).
// Verification just recomputes and compares (timing-safe). The user
// can never derive the secret from the cookie, and a forged cookie
// without the secret won't verify.

const PAYLOAD = "tc-dashboard-v1";
export const DASHBOARD_COOKIE = "tc_dashboard";

function secret(): string {
  return (
    process.env.DASHBOARD_SECRET ??
    process.env.DASHBOARD_PASSWORD ??
    ""
  );
}

export function expectedToken(): string {
  const s = secret();
  if (!s) return "";
  return crypto.createHmac("sha256", s).update(PAYLOAD).digest("hex");
}

export function isDashboardAuthed(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const expected = expectedToken();
  if (!expected) return false;
  try {
    const a = Buffer.from(cookieValue, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function constantTimeEqualsString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
