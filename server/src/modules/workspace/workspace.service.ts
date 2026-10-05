import { NotFoundError } from "../../common/utils/app-error.js";
import { deleteWorkspaceVectors } from "../../lib/pinecone.js";
import WorkspaceRepository, { WorkspaceRecord } from "./workspace.repository.js";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.validation.js";
import {
  buildCacheKey,
  getOrSetCache,
  delCache,
  delCachePattern,
} from "../../lib/cache.js";

class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async listWorkspacesByUser(userId: string) {
    const key = buildCacheKey("workspaces", "list", userId);
    return getOrSetCache(key, 300, () =>
      this.workspaceRepository.findWorkspaceByUserId(userId),
    );
  }

  async getWorkspaceByIdForUser(workspaceId: string, userId: string): Promise<WorkspaceRecord> {
    const key = buildCacheKey("workspace", workspaceId, userId);
    return getOrSetCache(key, 300, async () => {
      const [workspace] = await this.workspaceRepository.findWorkspaceByIdAndUserId(
        workspaceId,
        userId,
      );
      if (!workspace) throw new NotFoundError("Workspace not Found");
      return workspace;
    });
  }

  async createWorkspaceForUser(input: CreateWorkspaceInput, userId: string) {
    const [workspace] = await this.workspaceRepository.createWorkspaceRecord(input, userId);
    await delCache(buildCacheKey("workspaces", "list", userId));
    return workspace;
  }

  async updateWorkspaceForUser(input: UpdateWorkspaceInput, userId: string, workspaceId: string) {
    const [workspace] = await this.workspaceRepository.updateWorkspaceRecord(input, userId, workspaceId);
    if (!workspace) throw new NotFoundError("Workspace not found");
    await delCache(
      buildCacheKey("workspace", workspaceId, userId),
      buildCacheKey("workspaces", "list", userId),
    );
    return workspace;
  }

  async deleteWorkspaceForUser(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findWorkspaceByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) throw new NotFoundError("Workspace not found");
    try {
      await deleteWorkspaceVectors(workspaceId);
    } catch (e) {
      console.warn("Failed to delete workspace vectors from Pinecone:", e);
    }
    const result = await this.workspaceRepository.deleteWorkspaceRecord(workspaceId);
    await delCache(
      buildCacheKey("workspace", workspaceId, userId),
      buildCacheKey("workspaces", "list", userId),
    );
    await delCachePattern(buildCacheKey("*", workspaceId, "*"));
    return result;
  }
}

export default WorkspaceService;
