import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { artifactController } from "./artifact.controller.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.use(requireAuth);

artifactRoutes.get(
  "/",
  asyncHandler(artifactController.listArtifacts.bind(artifactController)),
);

artifactRoutes.post(
  "/",
  asyncHandler(artifactController.createArtifact.bind(artifactController)),
);

artifactRoutes.get(
  "/:artifactId",
  asyncHandler(artifactController.getArtifact.bind(artifactController)),
);

artifactRoutes.delete(
  "/:artifactId",
  asyncHandler(artifactController.deleteArtifact.bind(artifactController)),
);
