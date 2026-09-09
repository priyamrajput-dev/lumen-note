import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { Express } from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./route/index.js";
import { errorHandler } from "./common/middleware/error-handler.middleware.js";
import { env } from "./common/config/env.js";

export function createApplication(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  // routes
  registerRoutes(app);

  // error handler
  app.use(errorHandler);

  return app;
}
