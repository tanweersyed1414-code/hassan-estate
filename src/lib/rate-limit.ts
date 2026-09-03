// Lightweight in-memory rate limiter suitable for a single-instance deployment.
// For multi-instance production deployments, swap this for a shared store
// (e.g. Upstash Redis) behind the same `checkRateLimit` interface.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so memory doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
