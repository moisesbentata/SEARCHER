import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE_NAME = "tc_session";
const SESSION_TTL_DAYS = 60;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(opts: {
  accountId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<string> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      accountId: opts.accountId,
      tokenHash: hash(token),
      expiresAt,
      userAgent: opts.userAgent ?? null,
      ipAddress: opts.ipAddress ?? null,
    },
  });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function getCurrentSession() {
  const raw = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hash(raw) },
    include: { account: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  // Touch lastSeenAt occasionally — not every request, to save writes.
  if (Date.now() - session.lastSeenAt.getTime() > 15 * 60 * 1000) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
      .catch(() => undefined);
  }
  return session;
}

export async function destroyCurrentSession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (raw) {
    await prisma.session.deleteMany({ where: { tokenHash: hash(raw) } }).catch(() => undefined);
  }
  cookies().delete(SESSION_COOKIE_NAME);
}
