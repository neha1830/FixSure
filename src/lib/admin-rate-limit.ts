type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const buckets = new Map<string, Bucket>();

function clientKey(ip: string) {
  return ip || "unknown";
}

export function adminLoginLimited(ip: string): boolean {
  const key = clientKey(ip);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

/** Call only after a failed password/ID check. */
export function recordFailedAdminLogin(ip: string) {
  const key = clientKey(ip);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function resetAdminLoginLimit(ip: string) {
  buckets.delete(clientKey(ip));
}
