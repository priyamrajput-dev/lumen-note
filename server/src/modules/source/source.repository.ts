import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { source } from "../../db/schema/source.js";
import type { ListSourcesQuery } from "./source.validation.js";

export type SourceRecord = typeof source.$inferSelect;
export type CreateSourceData = typeof source.$inferInsert;

class SourceRepository {
  async createSourceRecord(data: CreateSourceData): Promise<SourceRecord> {
    const [record] = await db.insert(source).values(data).returning();
    return record;
  }

  async findSourcesByWorkspaceId(
    workspaceId: string,
    filters: ListSourcesQuery = {},
  ): Promise<SourceRecord[]> {
    const conditions = [eq(source.workspaceId, workspaceId)];

    if (filters.type) {
      conditions.push(eq(source.type, filters.type));
    }

    if (filters.status) {
      conditions.push(eq(source.status, filters.status));
    }

    if (filters.q) {
      const searchPattern = `%${filters.q}%`;
      const searchCondition = or(
        ilike(source.title, searchPattern),
        ilike(source.content, searchPattern),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    return await db
      .select()
      .from(source)
      .where(and(...conditions))
      .orderBy(desc(source.createdAt));
  }

  async findSourceByIdAndWorkspaceId(
    sourceId: string,
    workspaceId: string,
  ): Promise<SourceRecord | undefined> {
    const [record] = await db
      .select()
      .from(source)
      .where(and(eq(source.id, sourceId), eq(source.workspaceId, workspaceId)));
    return record;
  }

  async findSourceById(sourceId: string): Promise<SourceRecord | undefined> {
    const [record] = await db
      .select()
      .from(source)
      .where(eq(source.id, sourceId));
    return record;
  }

  async updateSourceRecord(
    sourceId: string,
    data: Partial<CreateSourceData>,
  ): Promise<SourceRecord | undefined> {
    const [record] = await db
      .update(source)
      .set(data)
      .where(eq(source.id, sourceId))
      .returning();
    return record;
  }

  async deleteSourceRecord(sourceId: string): Promise<void> {
    await db.delete(source).where(eq(source.id, sourceId));
  }

  async bulkDeleteSourceRecords(
    sourceIds: string[],
    workspaceId: string,
  ): Promise<void> {
    if (sourceIds.length === 0) return;
    await db
      .delete(source)
      .where(and(inArray(source.id, sourceIds), eq(source.workspaceId, workspaceId)));
  }
}

export default SourceRepository;
