import { NextResponse } from 'next/server';

/**
 * Best-effort in-memory sliding-window rate limiter.
 *
 * Note: in a multi-instance serverless deployment each instance keeps its own
 * counter, so this is not a hard global guarantee; pair it with a platform /
 * WAF / gateway limit in production. It is still effective at stopping casual
 * abuse, runaway client loops, and accidental credit burn.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 5000) sweep(now);

  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

export function isNonEmptyString(v: unknown, max = 100_000): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

export function isFiniteNumberInRange(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
}

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export const tooManyRequests = (retryAfter: number) =>
  NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
