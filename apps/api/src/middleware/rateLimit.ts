import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory, per-process rate limiting. Good enough for a single-instance
// deployment; would need a shared store (Redis) behind a load balancer.
export function rateLimit(options: { windowMs: number; max: number }) {
  const buckets = new Map<string, Bucket>();

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (bucket.count >= options.max) {
      throw new HttpError(429, "Too many requests. Please try again later.");
    }

    bucket.count += 1;
    next();
  };
}
