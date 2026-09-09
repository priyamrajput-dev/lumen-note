import SourceRepository, { type SourceRecord } from "./source.repository.js";
import WorkspaceRepository from "../workspace/workspace.repository.js";
import { NotFoundError } from "../../common/utils/app-error.js";
import type { CreateSourceInput, ListSourcesQuery } from "./source.validation.js";

class SourceService {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  private async assertWorkspaceAccess(workspaceId: string, userId: string) {
    const [ws] = await this.workspaceRepository.findWorkspaceByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!ws) {
      throw new NotFoundError("Workspace not found");
    }
    return ws;
  }

  async listSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
  ): Promise<SourceRecord[]> {
    await this.assertWorkspaceAccess(workspaceId, userId);
    return this.sourceRepository.findSourcesByWorkspaceId(workspaceId, filters);
  }

  async getSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    const sourceRecord = await this.sourceRepository.findSourceByIdAndWorkspaceId(
      sourceId,
      workspaceId,
    );

    if (!sourceRecord) {
      throw new NotFoundError("Source not found");
    }

    return sourceRecord;
  }

  async createTextOrMarkdownSource(
    workspaceId: string,
    userId: string,
    input: CreateSourceInput,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    return this.sourceRepository.createSourceRecord({
      workspaceId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: "READY",
    });
  }

  async deleteSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
  ): Promise<void> {
    await this.getSourceForWorkspace(workspaceId, sourceId, userId);
    await this.sourceRepository.deleteSourceRecord(sourceId);
  }

  async bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
  ): Promise<void> {
    await this.assertWorkspaceAccess(workspaceId, userId);
    await this.sourceRepository.bulkDeleteSourceRecords(sourceIds, workspaceId);
  }
}

export default SourceService;
