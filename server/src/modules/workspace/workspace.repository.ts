import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workspace } from "../../db/schema.js";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.validation.js";

export type WorkspaceRecord = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultModel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

class WorkspaceRepository {
  async findWorkspaceByUserId(userId: string) {
    const workspaces = await db
      .select()
      .from(workspace)
      .where(eq(workspace.userId, userId))
      .orderBy(desc(workspace.updatedAt));

    return workspaces;
  }

  async findWorkspaceByIdAndUserId(workspaceId: string, userId: string) {
    return await db
      .select()
      .from(workspace)
      .where(and(eq(workspace.id, workspaceId), eq(workspace.userId, userId)));
  }

  async createWorkspaceRecord(input: CreateWorkspaceInput, userId: string) {
    return await db
      .insert(workspace)
      .values({ ...input, userId })
      .returning();
  }

  async updateWorkspaceRecord(input: UpdateWorkspaceInput, userId: string, workspaceId: string) {
    return await db
      .update(workspace)
      .set(input)
      .where(and(eq(workspace.id, workspaceId), eq(workspace.userId, userId)))
      .returning();
  }

  async deleteWorkspaceRecord(workspaceId: string) {
    return await db.delete(workspace).where(eq(workspace.id, workspaceId));
  }
}

export default WorkspaceRepository;
