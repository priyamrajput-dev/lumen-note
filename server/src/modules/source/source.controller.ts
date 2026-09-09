import type { Request, Response } from "express";
import SourceService from "./source.service.js";
import {
  bulkDeleteSourcesSchema,
  createSourceSchema,
  listSourcesQuerySchema,
  sourceIdParamSchema,
  workspaceIdParamSchema,
} from "./source.validation.js";
import { ValidationError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import AppResponse from "../../common/utils/app-response.js";

class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  private parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);

    if (!parsed.success) {
      throw new ValidationError("Invalid workspace id", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  private parseSourceParams(params: Request["params"]) {
    const parsed = sourceIdParamSchema.safeParse(params);

    if (!parsed.success) {
      throw new ValidationError("Invalid source id", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  private parseListQuery(query: Request["query"]) {
    const parsed = listSourcesQuerySchema.safeParse(query);

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  private parseCreateBody(body: unknown) {
    const parsed = createSourceSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  private parseBulkDeleteBody(body: unknown) {
    const parsed = bulkDeleteSourcesSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }

    return parsed.data;
  }

  async listSources(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const filters = this.parseListQuery(req.query);
    const sources = await this.sourceService.listSourcesForWorkspace(
      workspaceId,
      req.session.user.id,
      filters,
    );
    AppResponse.ok(res, "Sources retrieved successfully", sources);
  }

  async getSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = this.parseSourceParams(req.params);
    const sourceRecord = await this.sourceService.getSourceForWorkspace(
      workspaceId,
      sourceId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Source retrieved successfully", sourceRecord);
  }

  async createSource(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const input = this.parseCreateBody(req.body);
    const sourceRecord = await this.sourceService.createTextOrMarkdownSource(
      workspaceId,
      req.session.user.id,
      input,
    );
    AppResponse.created(res, "Source created successfully", sourceRecord);
  }

  async deleteSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = this.parseSourceParams(req.params);
    await this.sourceService.deleteSourceForWorkspace(
      workspaceId,
      sourceId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Source deleted successfully");
  }

  async bulkDeleteSources(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const input = this.parseBulkDeleteBody(req.body);
    await this.sourceService.bulkDeleteSourcesForWorkspace(
      workspaceId,
      req.session.user.id,
      input.sourceIds,
    );
    AppResponse.ok(res, "Sources deleted successfully");
  }
}

export default SourceController;
