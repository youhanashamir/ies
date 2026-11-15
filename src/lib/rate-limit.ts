/**
 * Fixed-window, in-memory rate limiter for public form endpoints.
 *
 * Best-effort only: each serverless instance keeps its own counters, so a determined
 * client spreading requests across instances can exceed the limit. It still stops
 * casual abuse and scripted email flooding from a single client.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Returns true if the request is allowed, false if it exceeded `limit` within `windowMs`. */
export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
