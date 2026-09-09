import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import SourceController from "./source.controller.js";
import SourceService from "./source.service.js";
import SourceRepository from "./source.repository.js";
import WorkspaceRepository from "../workspace/workspace.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";

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
  asyncHandler(sourceController.createSource.bind(sourceController)),
);

sourceRoutes.post(
  "/bulk-delete",
  asyncHandler(sourceController.bulkDeleteSources.bind(sourceController)),
);

sourceRoutes.get(
  "/:sourceId",
  asyncHandler(sourceController.getSource.bind(sourceController)),
);

sourceRoutes.delete(
  "/:sourceId",
  asyncHandler(sourceController.deleteSource.bind(sourceController)),
);
