import { Redis } from "ioredis";
import { env } from "../common/config/env.js";

const keyPrefix = env.REDIS_KEY_PREFIX || "lumennote";
const environment = env.NODE_ENV || "development";

let isConnecting = false;
let isConnected = false;

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  connectTimeout: 5000,
  connectionName: "lumen-note-api",
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  tls: env.REDIS_URL.startsWith("rediss://")
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

redis.on("connect", () => {
  isConnected = true;
  console.log("[Redis] Connected to server");
});

redis.on("ready", () => {
  isConnected = true;
  console.log("[Redis] Client ready to receive commands");
});

redis.on("error", (err: Error) => {
  isConnected = false;
  console.error("[Redis] Connection error:", err.message);
});

redis.on("close", () => {
  isConnected = false;
  console.log("[Redis] Connection closed");
});

export async function connectRedis(): Promise<boolean> {
  if (isConnected || isConnecting) {
    return isConnected;
  }

  isConnecting = true;
  try {
    console.log("[Redis] Connecting to Redis...");
    await redis.connect();
    isConnected = true;
    return true;
  } catch (error) {
    isConnected = false;
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[Redis] Initial connection failed (continuing without blocking): ${msg}`);
    return false;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === "end") {
    return;
  }

  console.log("[Redis] Closing connection...");
  try {
    const quitPromise = redis.quit();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Redis quit timeout")), 2000),
    );
    await Promise.race([quitPromise, timeoutPromise]);
    console.log("[Redis] Gracefully disconnected");
  } catch {
    console.warn("[Redis] Forced disconnect after timeout");
    redis.disconnect();
  } finally {
    isConnected = false;
  }
}

export async function isRedisHealthy(): Promise<boolean> {
  if (redis.status !== "ready" && redis.status !== "connect") {
    return false;
  }

  try {
    const pingPromise = redis.ping();
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("PING timeout")), 1000),
    );
    const result = await Promise.race([pingPromise, timeoutPromise]);
    return result === "PONG";
  } catch {
    return false;
  }
}

export function redisKey(...parts: (string | number)[]): string {
  const filtered = parts.map(String).filter(Boolean);
  return `${keyPrefix}:${environment}:${filtered.join(":")}`;
}
