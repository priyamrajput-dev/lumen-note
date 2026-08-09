import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { Express } from "express";
import { auth } from "./lib/auth.js";
import { workspaceRoutes } from "./modules/workspace/workspace.route.js";

export function createApplication(): Express {
  const app = express();

  app.use(express.json());

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  //routes
  app.use("/api/workspace", workspaceRoutes);

  return app;
}
