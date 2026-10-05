import { rateLimit } from "../middleware/rate-limit.middleware.js";

/**
 * Rate limit policy definitions for Lumen Note API
 */

// 1. Global API safety net (300 requests/minute per IP or authenticated user)
export const globalApiRateLimiter = rateLimit({
  name: "global",
  strategy: "sliding-window",
  limit: 300,
  windowSec: 60,
  keyBy: "user-or-ip",
  failMode: "fail-open",
  skip: (req) => {
    const path = req.path || req.originalUrl || "";
    // Exempt health checks and inngest background worker webhook
    return (
      path === "/" ||
      path.startsWith("/health") ||
      path.startsWith("/api/health") ||
      path.startsWith("/api/inngest")
    );
  },
});

// 2. Auth limiter (20 attempts/minute per IP, strictly fail-closed)
export const authRateLimiter = rateLimit({
  name: "auth",
  strategy: "sliding-window",
  limit: 20,
  windowSec: 60,
  keyBy: "ip",
  failMode: "fail-closed",
  message: "Too many authentication requests. Please wait a minute before retrying.",
});

// 3. AI Streaming Chat limiter (token bucket: burst 10, refills 1 token every 15s per user)
export const chatRateLimiter = rateLimit({
  name: "chat",
  strategy: "token-bucket",
  capacity: 10,
  refillRatePerSec: 1 / 15, // 1 token every 15 seconds
  cost: 1,
  keyBy: "user",
  failMode: "fail-open",
  message: "AI chat rate limit reached. Please wait a few seconds before sending another message.",
});

// 4. Source Import limiter (token bucket: burst 5, refills 1 token every 60s per user)
// Protects PDF processing, Firecrawl web scraping, and YouTube transcripts
export const sourceImportRateLimiter = rateLimit({
  name: "source-import",
  strategy: "token-bucket",
  capacity: 5,
  refillRatePerSec: 1 / 60, // 1 token every 60 seconds
  cost: 1,
  keyBy: "user",
  failMode: "fail-open",
  message: "Source import rate limit reached. Please wait before uploading or importing more content.",
});

// 5. Artifact Generation limiter (token bucket: burst 6, refills 1 token every 30s per user)
export const artifactRateLimiter = rateLimit({
  name: "artifact",
  strategy: "token-bucket",
  capacity: 6,
  refillRatePerSec: 1 / 30, // 1 token every 30 seconds
  cost: 1,
  keyBy: "user",
  failMode: "fail-open",
  message: "Artifact generation limit reached. Please wait before generating additional study guides.",
});

// 6. Mutation limiter (60 writes/minute per user)
export const mutationRateLimiter = rateLimit({
  name: "mutation",
  strategy: "sliding-window",
  limit: 60,
  windowSec: 60,
  keyBy: "user",
  failMode: "fail-open",
  message: "Too many update requests. Please slow down.",
});
