import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { Express } from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./modules/route.js";
import { errorHandler } from "./common/middleware/error-handler.middleware.js";
import { env } from "./common/config/env.js";

import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js";

export function createApplication(): Express {
  const app = express();

  app.set("trust proxy", true);

  const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app")
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
      exposedHeaders: ["set-auth-token"],
    }),
  );

  app.use(express.json());

  app.get(["/", "/health", "/api/health"], (_req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Lumen Note API is running",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  const authHandler = toNodeHandler(auth);

  app.all("/api/auth/{*any}", (req, res, next) => {
    const isCallback =
      req.path.includes("/callback/") ||
      (req.originalUrl && req.originalUrl.includes("/callback/"));

    if (isCallback) {
      const appendTokenToLocation = () => {
        const code = res.statusCode;
        if (code === 302 || code === 307) {
          const location = res.getHeader("location") as string | undefined;
          if (location && !location.includes("token=") && !location.includes("error=")) {
            const setCookie = res.getHeader("set-cookie");
            const cookieStr = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie || "");
            const match = cookieStr.match(
              /(?:__Secure-better-auth\.session_token|better-auth\.session_token|session_token)=([^;]+)/,
            );
            if (match) {
              let rawToken = decodeURIComponent(match[1].trim());
              if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
                rawToken = rawToken.slice(1, -1);
              }
              const sep = location.includes("?") ? "&" : "?";
              res.setHeader("location", `${location}${sep}token=${encodeURIComponent(rawToken)}`);
            }
          }
        }
      };

      const origWriteHead = res.writeHead.bind(res);
      (res as any).writeHead = function (statusCode?: any, ...args: any[]) {
        if (typeof statusCode === "number") {
          res.statusCode = statusCode;
        }
        appendTokenToLocation();
        return (origWriteHead as any)(statusCode, ...args);
      };

      const origEnd = res.end.bind(res);
      (res as any).end = function (...args: any[]) {
        appendTokenToLocation();
        return (origEnd as any)(...args);
      };
    }
    return authHandler(req, res);
  });

  // inngest background jobs endpoint
  app.use(
    "/api/inngest",
    serve({
      client: inngest,
      functions,
    }),
  );

  // routes
  registerRoutes(app);

  // error handler
  app.use(errorHandler);

  return app;
}
