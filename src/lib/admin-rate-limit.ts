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
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}

export function resetAdminLoginLimit(ip: string) {
  buckets.delete(clientKey(ip));
}
