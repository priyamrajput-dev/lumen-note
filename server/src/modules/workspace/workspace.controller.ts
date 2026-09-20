import type { Request, Response } from "express";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from "./workspace.validation.js";
import { ValidationError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import WorkspaceService from "./workspace.service.js";
import AppResponse from "../../common/utils/app-response.js";

class WorspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  private parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid Workspace Id", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseCreateBody(body: unknown) {
    const parsed = createWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  private parseUpdateBody(body: unknown) {
    const parsed = updateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  async listWorkspaces(req: Request, res: Response) {
    const workspaces = await this.workspaceService.listWorkspacesByUser(req.session.user.id);
    AppResponse.ok(res, "Workspaces retrieved successfully", workspaces);
  }

  async getWorkspace(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const workspace = await this.workspaceService.getWorkspaceByIdForUser(
      workspaceId,
      req.session.user.id,
    );
    AppResponse.created(res, "Workspace retrieved successfully", workspace);
  }

  async createWorkspace(req: Request, res: Response) {
    const input = this.parseCreateBody(req.body);
    const workspace = await this.workspaceService.createWorkspaceForUser(
      input,
      req.session.user.id,
    );
    AppResponse.created(res, "Workspace created successfully", workspace);
  }

  async updateWorkspace(req: Request, res: Response) {
    const input = this.parseUpdateBody(req.body);
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const workspace = await this.workspaceService.updateWorkspaceForUser(
      input,
      req.session.user.id,
      workspaceId,
    );
    AppResponse.ok(res, "Workspace updated successfully", workspace);
  }

  async deleteWorkspace(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    await this.workspaceService.deleteWorkspaceForUser(workspaceId, req.session.user.id);
    AppResponse.ok(res, "Workspace deleted successfully");
  }
}

export default WorspaceController;
