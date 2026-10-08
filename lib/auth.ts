import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { hitRateLimit } from "@/lib/ratelimit";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  // Deliberately permissive: a syntactically-plausible email is enough,
  // real verification happens when the OTP email lands or doesn't.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  // 6-digit numeric, zero-padded.
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export type IssueOtpResult =
  | { ok: true }
  | { ok: false; reason: "RATE_LIMITED"; resetAt: Date }
  | { ok: false; reason: "INVALID_EMAIL" }
  | { ok: false; reason: "MAIL_FAILED"; detail?: string };

/**
 * Issue an OTP to the given email.
 *
 * Never leaks whether the email already has an account — the caller
 * MUST respond with the same opaque message regardless of result.
 */
export async function issueOtp(opts: {
  rawEmail: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<IssueOtpResult> {
  if (!isValidEmail(opts.rawEmail)) {
    return { ok: false, reason: "INVALID_EMAIL" };
  }
  const email = normalizeEmail(opts.rawEmail);

  // Rate limits: 3 codes per hour per email, 10 per hour per IP.
  const hour = 60 * 60 * 1000;
  const perEmail = await hitRateLimit({
    key: `send:email:${email}`,
    max: 3,
    windowMs: hour,
  });
  if (!perEmail.allowed) {
    return { ok: false, reason: "RATE_LIMITED", resetAt: perEmail.resetAt };
  }
  if (opts.ipAddress) {
    const perIp = await hitRateLimit({
      key: `send:ip:${opts.ipAddress}`,
      max: 10,
      windowMs: hour,
    });
    if (!perIp.allowed) {
      return { ok: false, reason: "RATE_LIMITED", resetAt: perIp.resetAt };
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.authCode.create({
    data: {
      email,
      codeHash: hashCode(code),
      expiresAt,
      attemptsRemaining: MAX_ATTEMPTS,
      ipAddress: opts.ipAddress ?? null,
      userAgent: opts.userAgent ?? null,
    },
  });

  try {
    await sendOtpEmail(email, code);
  } catch (e) {
    return {
      ok: false,
      reason: "MAIL_FAILED",
      detail: e instanceof Error ? e.message : String(e),
    };
  }

  return { ok: true };
}

export type VerifyOtpResult =
  | { ok: true; accountId: string; email: string; createdNewAccount: boolean }
  | { ok: false; reason: "INVALID_EMAIL" | "NO_CODE" | "EXPIRED" | "BAD_CODE" | "TOO_MANY_ATTEMPTS" };

export async function verifyOtp(opts: {
  rawEmail: string;
  code: string;
}): Promise<VerifyOtpResult> {
  if (!isValidEmail(opts.rawEmail)) return { ok: false, reason: "INVALID_EMAIL" };
  const email = normalizeEmail(opts.rawEmail);
  const code = opts.code.trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "BAD_CODE" };

  const now = new Date();
  const authCode = await prisma.authCode.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!authCode) return { ok: false, reason: "NO_CODE" };

  if (authCode.expiresAt.getTime() < now.getTime()) {
    return { ok: false, reason: "EXPIRED" };
  }
  if (authCode.attemptsRemaining <= 0) {
    return { ok: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  if (authCode.codeHash !== hashCode(code)) {
    await prisma.authCode.update({
      where: { id: authCode.id },
      data: { attemptsRemaining: { decrement: 1 } },
    });
    return { ok: false, reason: "BAD_CODE" };
  }

  await prisma.authCode.update({
    where: { id: authCode.id },
    data: { usedAt: now },
  });

  // Create or fetch the account.
  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return { ok: true, accountId: existing.id, email, createdNewAccount: false };
  }
  const created = await prisma.account.create({ data: { email } });
  return { ok: true, accountId: created.id, email, createdNewAccount: true };
}
