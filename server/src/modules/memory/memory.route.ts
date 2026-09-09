import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { memoryController } from "./memory.controller.js";

export const memoryRoutes = Router();

memoryRoutes.use(requireAuth);

memoryRoutes.get(
  "/",
  asyncHandler(memoryController.listMemories.bind(memoryController)),
);

memoryRoutes.post(
  "/",
  asyncHandler(memoryController.createMemory.bind(memoryController)),
);

memoryRoutes.patch(
  "/:memoryId",
  asyncHandler(memoryController.updateMemory.bind(memoryController)),
);

memoryRoutes.delete(
  "/:memoryId",
  asyncHandler(memoryController.deleteMemory.bind(memoryController)),
);
