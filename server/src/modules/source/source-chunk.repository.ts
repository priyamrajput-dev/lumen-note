import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sourceChunk } from "../../db/schema/source.js";

export type SourceChunkRecord = typeof sourceChunk.$inferSelect;
export type CreateSourceChunkData = typeof sourceChunk.$inferInsert;

class SourceChunkRepository {
  async createSourceChunks(
    chunks: CreateSourceChunkData[],
  ): Promise<SourceChunkRecord[]> {
    if (chunks.length === 0) {
      return [];
    }

    return await db.insert(sourceChunk).values(chunks).returning();
  }

  async findChunksBySourceId(sourceId: string): Promise<SourceChunkRecord[]> {
    return await db
      .select()
      .from(sourceChunk)
      .where(eq(sourceChunk.sourceId, sourceId))
      .orderBy(asc(sourceChunk.index));
  }

  async deleteChunksBySourceId(sourceId: string): Promise<void> {
    await db.delete(sourceChunk).where(eq(sourceChunk.sourceId, sourceId));
  }
}

export const sourceChunkRepository = new SourceChunkRepository();
export default SourceChunkRepository;
