import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { learningArtifact } from "../../db/schema/artifact.js";

export type ArtifactRecord = typeof learningArtifact.$inferSelect;
export type CreateArtifactData = typeof learningArtifact.$inferInsert;

class ArtifactRepository {
  async findArtifactsByWorkspaceId(
    workspaceId: string,
  ): Promise<ArtifactRecord[]> {
    return await db
      .select()
      .from(learningArtifact)
      .where(eq(learningArtifact.workspaceId, workspaceId))
      .orderBy(desc(learningArtifact.createdAt));
  }

  async findArtifactByIdAndWorkspaceId(
    artifactId: string,
    workspaceId: string,
  ): Promise<ArtifactRecord | undefined> {
    const [record] = await db
      .select()
      .from(learningArtifact)
      .where(
        and(
          eq(learningArtifact.id, artifactId),
          eq(learningArtifact.workspaceId, workspaceId),
        ),
      );
    return record;
  }

  async findArtifactById(
    artifactId: string,
  ): Promise<ArtifactRecord | undefined> {
    const [record] = await db
      .select()
      .from(learningArtifact)
      .where(eq(learningArtifact.id, artifactId));
    return record;
  }

  async createArtifactRecord(
    data: CreateArtifactData,
  ): Promise<ArtifactRecord> {
    const [record] = await db.insert(learningArtifact).values(data).returning();
    return record;
  }

  async updateArtifactRecord(
    artifactId: string,
    data: Partial<CreateArtifactData>,
  ): Promise<ArtifactRecord | undefined> {
    const [record] = await db
      .update(learningArtifact)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(learningArtifact.id, artifactId))
      .returning();
    return record;
  }

  async deleteArtifactRecord(artifactId: string): Promise<void> {
    await db
      .delete(learningArtifact)
      .where(eq(learningArtifact.id, artifactId));
  }
}

export const artifactRepository = new ArtifactRepository();
export default ArtifactRepository;
