import type { Express } from "express";
import { workspaceRoutes } from "../modules/workspace/workspace.route.js";
import { sourceRoutes } from "../modules/source/source.route.js";
import { chatRoutes } from "../modules/conversation/chat.route.js";
import { memoryRoutes } from "../modules/memory/memory.route.js";

export function registerRoutes(app: Express): void {
  workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
  workspaceRoutes.use("/:workspaceId/chat", chatRoutes);

  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/workspace", workspaceRoutes);
  app.use("/api/memories", memoryRoutes);
}
