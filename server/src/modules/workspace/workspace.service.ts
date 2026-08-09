import { NotFoundError } from "../../common/utils/app-error.js";
import WorkspaceRepository, { WorkspaceRecord } from "./workspace.repository.js";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.validation.js";

class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async listWorkspacesByUser(userId: string) {
    return this.workspaceRepository.findWorkspaceByUserId(userId);
  }

  async getWorkspaceByIdForUser(workspaceId: string, userId: string): Promise<WorkspaceRecord> {
    const [workspace] = await this.workspaceRepository.findWorkspaceByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) throw new NotFoundError("Workspace not Found");

    return workspace;
  }

  async createWorkspaceForUser(input: CreateWorkspaceInput, userId: string) {
    return this.workspaceRepository.createWorkspaceRecord(input, userId);
  }

  async updateWorkspaceForUser(input: UpdateWorkspaceInput, userId: string, workspaceId: string) {
    const workspace = this.workspaceRepository.updateWorkspaceRecord(input, userId, workspaceId);
    if (!workspace) throw new NotFoundError("Workspace not found");
    return workspace;
  }

  async deleteWorkspaceForUser(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findWorkspaceByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) throw new NotFoundError("Workspace not found");
    return this.workspaceRepository.deleteWorkspaceRecord(workspaceId);
  }
}

export default WorkspaceService;
