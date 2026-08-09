import { Router } from "express";
import WorspaceController from "./workspace.controller.js";
import WorkspaceService from "./workspace.service.js";
import WorkspaceRepository from "./workspace.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireAuth);

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository);
const workspaceController = new WorspaceController(workspaceService);


workspaceRoutes.get(
  "/",
  asyncHandler(workspaceController.listWorkspaces.bind(workspaceController)),
);
workspaceRoutes.post(
  "/",
  asyncHandler(workspaceController.createWorkspace.bind(workspaceController)),
);
workspaceRoutes.get(
  "/:workspaceId",
  asyncHandler(workspaceController.getWorkspace.bind(workspaceController)),
);
workspaceRoutes.patch(
  "/:workspaceId",
  asyncHandler(workspaceController.updateWorspace.bind(workspaceController)),
);
workspaceRoutes.delete(
  "/:workspaceId",
  asyncHandler(workspaceController.deleteWorkspace.bind(workspaceController)),
);
