import { prisma } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

/**
 * Fixed-window DB-backed rate limiter.
 *
 * Not perfect (two concurrent requests can race through the limit),
 * but good enough for auth-code rate limiting at this scale — we are
 * guarding against humans and basic scripts, not sophisticated attackers.
 */
export async function hitRateLimit(opts: {
  key: string;
  max: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key: opts.key } });

  if (!bucket || bucket.resetAt.getTime() <= now.getTime()) {
    const resetAt = new Date(now.getTime() + opts.windowMs);
    await prisma.rateLimitBucket.upsert({
      where: { key: opts.key },
      create: { key: opts.key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }

  if (bucket.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  const updated = await prisma.rateLimitBucket.update({
    where: { key: opts.key },
    data: { count: { increment: 1 } },
  });
  return {
    allowed: true,
    remaining: Math.max(0, opts.max - updated.count),
    resetAt: updated.resetAt,
  };
}
