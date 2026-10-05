import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { artifactController } from "./artifact.controller.js";
import {
  artifactRateLimiter,
  mutationRateLimiter,
} from "../../common/config/rate-limits.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.use(requireAuth);

artifactRoutes.get(
  "/",
  asyncHandler(artifactController.listArtifacts.bind(artifactController)),
);

artifactRoutes.post(
  "/",
  artifactRateLimiter,
  asyncHandler(artifactController.createArtifact.bind(artifactController)),
);

artifactRoutes.get(
  "/:artifactId",
  asyncHandler(artifactController.getArtifact.bind(artifactController)),
);

artifactRoutes.delete(
  "/:artifactId",
  mutationRateLimiter,
  asyncHandler(artifactController.deleteArtifact.bind(artifactController)),
);
