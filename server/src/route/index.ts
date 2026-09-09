import type { Express } from "express";
import { workspaceRoutes } from "../modules/workspace/workspace.route.js";
import { sourceRoutes } from "../modules/source/source.route.js";

export function registerRoutes(app: Express): void {
  workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/workspace", workspaceRoutes);
}
