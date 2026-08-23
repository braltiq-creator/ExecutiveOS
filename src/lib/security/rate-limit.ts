import { RateLimitError } from "@/lib/errors";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

export function assertRateLimit(config: RateLimitConfig): void {
  const now = Date.now();
  const existing = buckets.get(config.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(config.key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  if (existing.count >= config.limit) {
    throw new RateLimitError();
  }

  existing.count += 1;
}

export function createUserRateLimitKey(userId: string, action: string): string {
  return `${userId}:${action}`;
}

export function clearRateLimits(): void {
  buckets.clear();
}
