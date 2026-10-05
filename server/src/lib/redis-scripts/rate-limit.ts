import { redis } from "../redis.js";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  resetAt: number; // Unix epoch in seconds
  limit: number;
}

export interface SlidingWindowOptions {
  key: string;
  windowMs: number;
  limit: number;
  cost?: number;
}

export interface TokenBucketOptions {
  key: string;
  capacity: number;
  refillRatePerSec: number;
  cost?: number;
}

/**
 * Sliding Window Counter Lua Script
 * Tracks current and previous window counts with linear weighting for a smooth transition.
 * Guaranteed 1 Redis round trip, single key, Redis server time.
 */
export const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local cost = tonumber(ARGV[3] or "1")

local time = redis.call('TIME')
local nowMs = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)

local currentWindow = math.floor(nowMs / windowMs)
local prevWinKey = "prev_win"
local prevCntKey = "prev_cnt"
local currWinKey = "curr_win"
local currCntKey = "curr_cnt"

local data = redis.call('HMGET', key, currWinKey, currCntKey, prevWinKey, prevCntKey)
local currWin = tonumber(data[1] or "0")
local currCnt = tonumber(data[2] or "0")
local prevWin = tonumber(data[3] or "0")
local prevCnt = tonumber(data[4] or "0")

if currWin ~= currentWindow then
  if currWin == currentWindow - 1 then
    prevWin = currWin
    prevCnt = currCnt
  else
    prevWin = currentWindow - 1
    prevCnt = 0
  end
  currWin = currentWindow
  currCnt = 0
end

local timeInCurrentWindow = nowMs % windowMs
local weight = (windowMs - timeInCurrentWindow) / windowMs
local weightedCount = math.floor(prevCnt * weight) + currCnt

local allowed = 0
local remaining = 0
local retryAfterMs = 0
local resetMs = (currentWindow + 1) * windowMs

if (weightedCount + cost) <= limit then
  allowed = 1
  currCnt = currCnt + cost
  remaining = math.max(0, limit - (weightedCount + cost))
  retryAfterMs = 0

  redis.call('HMSET', key, currWinKey, currWin, currCntKey, currCnt, prevWinKey, prevWin, prevCntKey, prevCnt)
  local ttlSeconds = math.ceil((windowMs * 2) / 1000) + 1
  redis.call('EXPIRE', key, ttlSeconds)
else
  allowed = 0
  remaining = 0
  retryAfterMs = math.max(100, windowMs - timeInCurrentWindow)
  local ttlSeconds = math.ceil((windowMs * 2) / 1000) + 1
  redis.call('EXPIRE', key, ttlSeconds)
end

return { allowed, remaining, retryAfterMs, resetMs, limit }
`;

/**
 * Token Bucket Lua Script
 * Supports burst allowance up to capacity and refills continuously at refillRatePerSec.
 * Supports variable cost for heavy endpoints (e.g. file vectorization or AI streaming).
 */
export const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRatePerSec = tonumber(ARGV[2])
local cost = tonumber(ARGV[3] or "1")

local time = redis.call('TIME')
local nowMs = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)

local data = redis.call('HMGET', key, "tokens", "last_refill_ms")
local tokens = tonumber(data[1])
local lastRefillMs = tonumber(data[2])

if not tokens or not lastRefillMs then
  tokens = capacity
  lastRefillMs = nowMs
else
  local elapsedMs = math.max(0, nowMs - lastRefillMs)
  local generatedTokens = (elapsedMs / 1000) * refillRatePerSec
  tokens = math.min(capacity, tokens + generatedTokens)
  lastRefillMs = nowMs
end

local allowed = 0
local remaining = 0
local retryAfterMs = 0
local resetMs = nowMs

if tokens >= cost then
  allowed = 1
  tokens = tokens - cost
  remaining = math.floor(tokens)
  retryAfterMs = 0

  local timeToFullSec = (capacity - tokens) / refillRatePerSec
  resetMs = nowMs + math.ceil(timeToFullSec * 1000)

  redis.call('HMSET', key, "tokens", string.format("%.4f", tokens), "last_refill_ms", lastRefillMs)
  local ttlSeconds = math.max(60, math.ceil((capacity / refillRatePerSec) * 2))
  redis.call('EXPIRE', key, ttlSeconds)
else
  allowed = 0
  remaining = math.max(0, math.floor(tokens))
  local missing = cost - tokens
  retryAfterMs = math.ceil((missing / refillRatePerSec) * 1000)
  resetMs = nowMs + retryAfterMs

  redis.call('HMSET', key, "tokens", string.format("%.4f", tokens), "last_refill_ms", lastRefillMs)
  local ttlSeconds = math.max(60, math.ceil((capacity / refillRatePerSec) * 2))
  redis.call('EXPIRE', key, ttlSeconds)
end

return { allowed, remaining, retryAfterMs, resetMs, math.floor(capacity) }
`;

let commandsRegistered = false;

export function registerRateLimitCommands(): void {
  if (commandsRegistered) return;

  redis.defineCommand("checkSlidingWindowLimit", {
    numberOfKeys: 1,
    lua: SLIDING_WINDOW_LUA,
  });

  redis.defineCommand("checkTokenBucketLimit", {
    numberOfKeys: 1,
    lua: TOKEN_BUCKET_LUA,
  });

  commandsRegistered = true;
}

// Auto-register commands
registerRateLimitCommands();

export async function checkSlidingWindow(
  options: SlidingWindowOptions,
): Promise<RateLimitResult> {
  registerRateLimitCommands();
  const raw = (await (redis as any).checkSlidingWindowLimit(
    options.key,
    options.windowMs,
    options.limit,
    options.cost ?? 1,
  )) as [number, number, number, number, number];

  const [allowed, remaining, retryAfterMs, resetMs, limit] = raw;
  return {
    allowed: allowed === 1,
    remaining: Number(remaining),
    retryAfterSec: Math.ceil(Number(retryAfterMs) / 1000),
    resetAt: Math.ceil(Number(resetMs) / 1000),
    limit: Number(limit),
  };
}

export async function checkTokenBucket(
  options: TokenBucketOptions,
): Promise<RateLimitResult> {
  registerRateLimitCommands();
  const raw = (await (redis as any).checkTokenBucketLimit(
    options.key,
    options.capacity,
    options.refillRatePerSec,
    options.cost ?? 1,
  )) as [number, number, number, number, number];

  const [allowed, remaining, retryAfterMs, resetMs, limit] = raw;
  return {
    allowed: allowed === 1,
    remaining: Number(remaining),
    retryAfterSec: Math.ceil(Number(retryAfterMs) / 1000),
    resetAt: Math.ceil(Number(resetMs) / 1000),
    limit: Number(limit),
  };
}
