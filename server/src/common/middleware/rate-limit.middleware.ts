import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { redisKey } from "../../lib/redis.js";
import {
  checkSlidingWindow,
  checkTokenBucket,
  type RateLimitResult,
} from "../../lib/redis-scripts/rate-limit.js";
import { AppError } from "../utils/app-error.js";

export type RateLimitStrategy = "sliding-window" | "token-bucket";
export type KeyBy = "ip" | "user" | "user-or-ip" | ((req: Request) => string);
export type FailMode = "fail-open" | "fail-closed";

export interface RateLimitOptions {
  name: string;
  strategy?: RateLimitStrategy;
  limit?: number | ((req: Request) => number);
  windowSec?: number; // for sliding-window (default: 60)
  capacity?: number | ((req: Request) => number); // for token-bucket
  refillRatePerSec?: number; // for token-bucket (tokens per second)
  cost?: number | ((req: Request) => number);
  keyBy?: KeyBy;
  failMode?: FailMode;
  timeoutMs?: number; // default 200ms
  message?: string;
  skip?: (req: Request) => boolean;
}

let lastLogTimestamp = 0;
function logRateLimitFailure(name: string, error: unknown) {
  const now = Date.now();
  // Throttle logging to once every 10 seconds to avoid spamming logs during Redis downtime
  if (now - lastLogTimestamp > 10000) {
    lastLogTimestamp = now;
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[RateLimit] Redis error on policy "${name}" (failing open): ${msg}`);
  }
}

export function normalizeIp(ip: string | undefined): string {
  if (!ip) return "127.0.0.1";
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 4).join(":")}::/64`;
  }
  return ip;
}

export function extractClientIdentifier(req: Request, keyBy: KeyBy = "user-or-ip"): string {
  if (typeof keyBy === "function") {
    return keyBy(req);
  }

  const userId = (req as any).session?.user?.id;

  if (keyBy === "user") {
    return userId || normalizeIp(req.ip);
  }

  if (keyBy === "ip") {
    return normalizeIp(req.ip);
  }

  // user-or-ip
  return userId ? `user:${userId}` : `ip:${normalizeIp(req.ip)}`;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    name,
    strategy = "sliding-window",
    limit = 60,
    windowSec = 60,
    capacity,
    refillRatePerSec = 1,
    cost = 1,
    keyBy = "user-or-ip",
    failMode = "fail-open",
    timeoutMs = 200,
    message = "Too many requests, please try again later",
    skip,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip if rate limiting is globally disabled, running tests, or skipped by custom rule
    if (env.RATE_LIMIT_ENABLED === false || env.NODE_ENV === "test") {
      return next();
    }

    if (skip && skip(req)) {
      return next();
    }

    const identifier = extractClientIdentifier(req, keyBy);
    const key = redisKey("rl", name, identifier);

    const resolvedCost = typeof cost === "function" ? cost(req) : cost;
    const resolvedLimit = typeof limit === "function" ? limit(req) : limit;
    const resolvedCapacity =
      typeof capacity === "function"
        ? capacity(req)
        : (capacity ?? resolvedLimit);

    try {
      const evaluationPromise =
        strategy === "token-bucket"
          ? checkTokenBucket({
              key,
              capacity: resolvedCapacity,
              refillRatePerSec,
              cost: resolvedCost,
            })
          : checkSlidingWindow({
              key,
              windowMs: windowSec * 1000,
              limit: resolvedLimit,
              cost: resolvedCost,
            });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Rate limit check timed out")), timeoutMs),
      );

      const result = await Promise.race<RateLimitResult>([
        evaluationPromise,
        timeoutPromise,
      ]);

      // Set standard RFC-compatible RateLimit headers
      res.setHeader("RateLimit-Limit", result.limit);
      res.setHeader("RateLimit-Remaining", result.remaining);
      res.setHeader("RateLimit-Reset", result.resetAt);

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfterSec);
        return next(
          new AppError(429, message, {
            retryAfterSec: result.retryAfterSec,
            resetAt: result.resetAt,
          }),
        );
      }

      return next();
    } catch (error) {
      if (failMode === "fail-closed") {
        console.error(`[RateLimit] Policy "${name}" failed closed:`, error);
        return next(
          new AppError(503, "Service temporarily unavailable due to rate limiter outage"),
        );
      }

      // Fail-open: log throttled warning and allow request to proceed
      logRateLimitFailure(name, error);
      return next();
    }
  };
}
