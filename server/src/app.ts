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

  app.get(["/", "/health"], (_req, res) => {
    res.status(200).json({ status: "ok", message: "Lumen Note API is running" });
  });

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  app.all("/api/auth/{*any}", toNodeHandler(auth));

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
