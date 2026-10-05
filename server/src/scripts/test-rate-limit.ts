import { redis, connectRedis, disconnectRedis, redisKey } from "../lib/redis.js";
import {
  checkSlidingWindow,
  checkTokenBucket,
} from "../lib/redis-scripts/rate-limit.js";
import { rateLimit } from "../common/middleware/rate-limit.middleware.js";
import type { Request, Response, NextFunction } from "express";

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: unknown) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`, details || "");
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   LUMEN NOTE: ATOMIC LUA RATE LIMITER TEST SUITE");
  console.log("=======================================================\n");

  await connectRedis();

  const testId = Date.now().toString();

  // -----------------------------------------------------------
  // TEST 1: Sliding Window - Under, Exactly At, and Over Limit
  // -----------------------------------------------------------
  console.log("1. Testing Sliding Window Counter (Under, At, Over Limit):");
  const swKey = redisKey("test", "sw", testId);
  const swLimit = 3;

  const r1 = await checkSlidingWindow({ key: swKey, windowMs: 60000, limit: swLimit });
  assert(r1.allowed && r1.remaining === 2 && r1.limit === 3, "Call 1: allowed, remaining=2");

  const r2 = await checkSlidingWindow({ key: swKey, windowMs: 60000, limit: swLimit });
  assert(r2.allowed && r2.remaining === 1, "Call 2: allowed, remaining=1");

  const r3 = await checkSlidingWindow({ key: swKey, windowMs: 60000, limit: swLimit });
  assert(r3.allowed && r3.remaining === 0, "Call 3: exactly at limit, allowed, remaining=0");

  const r4 = await checkSlidingWindow({ key: swKey, windowMs: 60000, limit: swLimit });
  assert(!r4.allowed && r4.remaining === 0 && r4.retryAfterSec > 0, "Call 4: over limit, blocked, retryAfter > 0");

  const swTTL = await redis.ttl(swKey);
  assert(swTTL > 0 && swTTL <= 125, `Key TTL properly configured (${swTTL}s)`);

  // -----------------------------------------------------------
  // TEST 2: Token Bucket - Burst, Variable Cost & Refill
  // -----------------------------------------------------------
  console.log("\n2. Testing Token Bucket (Burst, Cost > 1, Refill):");
  const tbKey = redisKey("test", "tb", testId);
  const capacity = 5;
  const refillRatePerSec = 2; // 2 tokens per second

  // Call with cost 1
  const t1 = await checkTokenBucket({ key: tbKey, capacity, refillRatePerSec, cost: 1 });
  assert(t1.allowed && t1.remaining === 4, "Token bucket call 1 (cost 1): allowed, remaining=4");

  // Call with cost 3
  const t2 = await checkTokenBucket({ key: tbKey, capacity, refillRatePerSec, cost: 3 });
  assert(t2.allowed && t2.remaining === 1, "Token bucket call 2 (cost 3): allowed, remaining=1");

  // Call with cost 2 (only 1 remaining, so should be blocked)
  const t3 = await checkTokenBucket({ key: tbKey, capacity, refillRatePerSec, cost: 2 });
  assert(!t3.allowed && t3.remaining === 1 && t3.retryAfterSec > 0, "Token bucket call 3 (cost 2 > 1 remaining): rejected");

  // Wait 1.1s for refill (should generate ~2 tokens)
  console.log("   Waiting 1.1s for token refill...");
  await new Promise((r) => setTimeout(r, 1100));

  const t4 = await checkTokenBucket({ key: tbKey, capacity, refillRatePerSec, cost: 2 });
  assert(t4.allowed, "Token bucket call 4 after refill: allowed");

  // -----------------------------------------------------------
  // TEST 3: High Concurrency (50 Parallel Requests vs Limit 10)
  // -----------------------------------------------------------
  console.log("\n3. Testing Atomic Concurrency (50 parallel requests, limit 10):");
  const concKey = redisKey("test", "conc", testId);
  const concurrencyLimit = 10;
  const requests = Array.from({ length: 50 }, () =>
    checkSlidingWindow({ key: concKey, windowMs: 60000, limit: concurrencyLimit }),
  );

  const results = await Promise.all(requests);
  const allowedCount = results.filter((r) => r.allowed).length;
  const blockedCount = results.filter((r) => !r.allowed).length;

  assert(
    allowedCount === concurrencyLimit && blockedCount === 40,
    `Exactly ${concurrencyLimit} allowed and 40 rejected (Allowed: ${allowedCount}, Blocked: ${blockedCount})`,
  );

  // -----------------------------------------------------------
  // TEST 4: Key Isolation (User vs IP vs Different Policy Names)
  // -----------------------------------------------------------
  console.log("\n4. Testing Key Isolation:");
  const userKey = redisKey("rl", "chat", "user:u_123");
  const ipKey = redisKey("rl", "chat", "ip:192.168.1.1");
  const otherPolicyKey = redisKey("rl", "sources", "user:u_123");

  await checkSlidingWindow({ key: userKey, windowMs: 60000, limit: 1 });
  const userBlocked = await checkSlidingWindow({ key: userKey, windowMs: 60000, limit: 1 });
  const ipAllowed = await checkSlidingWindow({ key: ipKey, windowMs: 60000, limit: 1 });
  const otherPolicyAllowed = await checkSlidingWindow({ key: otherPolicyKey, windowMs: 60000, limit: 1 });

  assert(!userBlocked.allowed, "User u_123 is blocked on chat policy");
  assert(ipAllowed.allowed, "IP 192.168.1.1 is unaffected by user quota");
  assert(otherPolicyAllowed.allowed, "User u_123 on 'sources' policy has independent quota");

  // -----------------------------------------------------------
  // TEST 5: Middleware Fail-Open & Fail-Closed Behaviors
  // -----------------------------------------------------------
  console.log("\n5. Testing Middleware Behavior (Fail-Open / Fail-Closed):");
  const mockReq = (userId?: string, ip = "127.0.0.1") =>
    ({
      session: userId ? { user: { id: userId } } : undefined,
      ip,
      path: "/api/test",
      headers: {},
    }) as unknown as Request;

  const mockRes = () => {
    const headers: Record<string, any> = {};
    return {
      setHeader: (name: string, val: any) => {
        headers[name.toLowerCase()] = val;
      },
      getHeader: (name: string) => headers[name.toLowerCase()],
      headers,
    } as unknown as Response & { headers: Record<string, any> };
  };

  // Test middleware execution and headers
  const testMw = rateLimit({
    name: `mw_test_${testId}`,
    limit: 2,
    windowSec: 60,
  });

  const res1 = mockRes();
  let err1: any = null;
  await testMw(mockReq("user_test"), res1, (e?: any) => { err1 = e; });

  assert(!err1 && res1.headers["ratelimit-remaining"] === 1, "Middleware sets RateLimit headers and allows request");

  // Test fail-closed middleware with bad key or timeout
  const failClosedMw = rateLimit({
    name: "fail_closed_test",
    failMode: "fail-closed",
    timeoutMs: 1, // forced immediate timeout
    keyBy: () => "simulate_timeout",
  });

  const resFc = mockRes();
  let errFc: any = null;
  await failClosedMw(mockReq(), resFc, (e?: any) => { errFc = e; });
  assert(errFc && errFc.statusCode === 503, "Fail-closed rejects with 503 on timeout/failure");

  // Test fail-open middleware with forced timeout
  const failOpenMw = rateLimit({
    name: "fail_open_test",
    failMode: "fail-open",
    timeoutMs: 1, // forced immediate timeout
    keyBy: () => "simulate_timeout",
  });

  const resFo = mockRes();
  let errFo: any = null;
  await failOpenMw(mockReq(), resFo, (e?: any) => { errFo = e; });
  assert(!errFo, "Fail-open allows request to proceed on timeout/failure");

  // -----------------------------------------------------------
  // TEST 6: Live Express HTTP Server (Real 429 Status & Headers)
  // -----------------------------------------------------------
  console.log("\n6. Testing Live Express HTTP Integration (Real 429 & JSON Body):");
  const express = (await import("express")).default;
  const { errorHandler } = await import("../common/middleware/error-handler.middleware.js");

  const testApp = express();
  const httpTestKey = `http_test_${testId}`;
  testApp.get(
    "/api/live-test",
    rateLimit({ name: httpTestKey, limit: 2, windowSec: 60 }),
    (_req, res) => {
      res.status(200).json({ status: "success" });
    },
  );
  testApp.use(errorHandler);

  const testServer = await new Promise<import("http").Server>((resolve) => {
    const s = testApp.listen(0, () => resolve(s));
  });
  const port = (testServer.address() as any).port;

  try {
    const httpRes1 = await fetch(`http://127.0.0.1:${port}/api/live-test`);
    const body1 = await httpRes1.json();
    assert(
      httpRes1.status === 200 && httpRes1.headers.get("ratelimit-remaining") === "1",
      `HTTP Request 1 allowed (status 200, remaining=1)`,
    );

    const httpRes2 = await fetch(`http://127.0.0.1:${port}/api/live-test`);
    const body2 = await httpRes2.json();
    assert(
      httpRes2.status === 200 && httpRes2.headers.get("ratelimit-remaining") === "0",
      `HTTP Request 2 allowed (status 200, remaining=0)`,
    );

    const httpRes3 = await fetch(`http://127.0.0.1:${port}/api/live-test`);
    const body3: any = await httpRes3.json();
    assert(
      httpRes3.status === 429 &&
      Number(httpRes3.headers.get("retry-after")) > 0 &&
      body3.error === "Too many requests, please try again later" &&
      typeof body3.details?.retryAfterSec === "number",
      `HTTP Request 3 blocked (status 429, Retry-After header present, AppError JSON body matched)`,
    );
  } finally {
    await new Promise<void>((resolve) => testServer.close(() => resolve()));
    const createdHttpKey = redisKey("rl", httpTestKey, "*");
    const httpKeys = await redis.keys(createdHttpKey);
    if (httpKeys.length > 0) {
      await redis.del(...httpKeys);
    }
  }

  // -----------------------------------------------------------
  // TEST 7: Redis Scan and Key TTL Inspection
  // -----------------------------------------------------------
  console.log("\n7. Inspecting Created Redis Keys and TTLs:");
  const testPattern = redisKey("test", "*");
  const createdKeys = await redis.keys(testPattern);

  console.log(`   Found ${createdKeys.length} test keys with pattern "${testPattern}":`);
  for (const k of createdKeys.slice(0, 5)) {
    const ttl = await redis.ttl(k);
    console.log(`     • ${k} (TTL: ${ttl}s)`);
  }

  // Clean up test keys
  if (createdKeys.length > 0) {
    await redis.del(...createdKeys);
    console.log("   Cleaned up test keys.");
  }
  await redis.del(userKey, ipKey, otherPolicyKey);

  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedTests} passed, ${failedTests} failed.`);
  console.log("=======================================================\n");

  await disconnectRedis();

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(async (err) => {
  console.error("Test execution failed:", err);
  await disconnectRedis();
  process.exit(1);
});
