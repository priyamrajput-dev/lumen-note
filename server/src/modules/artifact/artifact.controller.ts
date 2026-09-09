import type { Request, Response } from "express";
import {
  artifactIdParamSchema,
  createArtifactSchema,
} from "./artifact.validation.js";
import { workspaceIdParamSchema } from "../workspace/workspace.validation.js";
import { ValidationError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import AppResponse from "../../common/utils/app-response.js";
import {
  createArtifactForWorkspace,
  deleteArtifactForWorkspace,
  getArtifactForWorkspace,
  listArtifactsForWorkspace,
} from "./artifact.service.js";

class ArtifactController {
  private parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid workspace id", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseArtifactParams(params: Request["params"]) {
    const parsed = artifactIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid artifact parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseCreateBody(body: unknown) {
    const parsed = createArtifactSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  async listArtifacts(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const artifacts = await listArtifactsForWorkspace(
      workspaceId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Artifacts retrieved successfully", artifacts);
  }

  async getArtifact(req: Request, res: Response) {
    const { workspaceId, artifactId } = this.parseArtifactParams(req.params);
    const artifact = await getArtifactForWorkspace(
      workspaceId,
      artifactId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Artifact retrieved successfully", artifact);
  }

  async createArtifact(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const input = this.parseCreateBody(req.body);
    const artifact = await createArtifactForWorkspace(
      workspaceId,
      req.session.user.id,
      input,
    );
    AppResponse.created(res, "Artifact generation started", artifact);
  }

  async deleteArtifact(req: Request, res: Response) {
    const { workspaceId, artifactId } = this.parseArtifactParams(req.params);
    await deleteArtifactForWorkspace(
      workspaceId,
      artifactId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Artifact deleted successfully");
  }
}

export const artifactController = new ArtifactController();
export default ArtifactController;
