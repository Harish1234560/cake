type RateLimitEntry = { count: number; resetAt: number };

const limits = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { ok: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function clearRateLimit(key: string): void {
  limits.delete(key);
}
