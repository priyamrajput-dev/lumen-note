import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { memoryController } from "./memory.controller.js";
import { mutationRateLimiter } from "../../common/config/rate-limits.js";

export const memoryRoutes = Router();

memoryRoutes.use(requireAuth);

memoryRoutes.get(
  "/",
  asyncHandler(memoryController.listMemories.bind(memoryController)),
);

memoryRoutes.post(
  "/",
  mutationRateLimiter,
  asyncHandler(memoryController.createMemory.bind(memoryController)),
);

memoryRoutes.patch(
  "/:memoryId",
  mutationRateLimiter,
  asyncHandler(memoryController.updateMemory.bind(memoryController)),
);

memoryRoutes.delete(
  "/:memoryId",
  mutationRateLimiter,
  asyncHandler(memoryController.deleteMemory.bind(memoryController)),
);
