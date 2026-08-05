import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { Express } from "express";
import { auth } from "./lib/auth.js";

export function createApplication(): Express {
  const app = express();

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  return app;
}
