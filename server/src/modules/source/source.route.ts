import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import SourceController from "./source.controller.js";
import SourceService from "./source.service.js";
import SourceRepository from "./source.repository.js";
import WorkspaceRepository from "../workspace/workspace.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { uploadSinglePdf } from "../../common/middleware/upload.middleware.js";
import {
  sourceImportRateLimiter,
  mutationRateLimiter,
} from "../../common/config/rate-limits.js";

export const sourceRoutes = Router({ mergeParams: true });

sourceRoutes.use(requireAuth);

const sourceRepository = new SourceRepository();
const workspaceRepository = new WorkspaceRepository();
const sourceService = new SourceService(sourceRepository, workspaceRepository);
const sourceController = new SourceController(sourceService);

sourceRoutes.get(
  "/",
  asyncHandler(sourceController.listSources.bind(sourceController)),
);

sourceRoutes.post(
  "/",
  mutationRateLimiter,
  asyncHandler(sourceController.createSource.bind(sourceController)),
);

sourceRoutes.post(
  "/upload",
  sourceImportRateLimiter,
  uploadSinglePdf,
  asyncHandler(sourceController.uploadPdf.bind(sourceController)),
);

sourceRoutes.post(
  "/import/website",
  sourceImportRateLimiter,
  asyncHandler(sourceController.importWebsite.bind(sourceController)),
);

sourceRoutes.post(
  "/import/youtube",
  sourceImportRateLimiter,
  asyncHandler(sourceController.importYoutube.bind(sourceController)),
);

sourceRoutes.post(
  "/bulk-delete",
  mutationRateLimiter,
  asyncHandler(sourceController.bulkDeleteSources.bind(sourceController)),
);

sourceRoutes.get(
  "/:sourceId",
  asyncHandler(sourceController.getSource.bind(sourceController)),
);

sourceRoutes.delete(
  "/:sourceId",
  mutationRateLimiter,
  asyncHandler(sourceController.deleteSource.bind(sourceController)),
);
