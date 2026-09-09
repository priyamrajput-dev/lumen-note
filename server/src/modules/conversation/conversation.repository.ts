import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { conversation } from "../../db/schema/conversation.js";

export type ConversationRecord = typeof conversation.$inferSelect;
export type CreateConversationData = typeof conversation.$inferInsert;

class ConversationRepository {
  async findConversationsByWorkspaceId(
    workspaceId: string,
  ): Promise<ConversationRecord[]> {
    return await db
      .select()
      .from(conversation)
      .where(eq(conversation.workspaceId, workspaceId))
      .orderBy(desc(conversation.updatedAt));
  }

  async findConversationById(
    conversationId: string,
  ): Promise<ConversationRecord | undefined> {
    const [record] = await db
      .select()
      .from(conversation)
      .where(eq(conversation.id, conversationId));
    return record;
  }

  async findConversationByIdAndWorkspaceId(
    conversationId: string,
    workspaceId: string,
  ): Promise<ConversationRecord | undefined> {
    const [record] = await db
      .select()
      .from(conversation)
      .where(
        and(
          eq(conversation.id, conversationId),
          eq(conversation.workspaceId, workspaceId),
        ),
      );
    return record;
  }

  async createConversationRecord(
    workspaceId: string,
    title?: string,
  ): Promise<ConversationRecord> {
    const [record] = await db
      .insert(conversation)
      .values({
        workspaceId,
        title: title ?? null,
      })
      .returning();
    return record;
  }

  async updateConversationSummary(
    conversationId: string,
    data: {
      summary: string;
      summaryMessageCount: number;
    },
  ): Promise<ConversationRecord | undefined> {
    const [record] = await db
      .update(conversation)
      .set({
        summary: data.summary,
        summaryMessageCount: data.summaryMessageCount,
        summarizedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(conversation.id, conversationId))
      .returning();
    return record;
  }

  async updateConversationRecord(
    conversationId: string,
    data: { title?: string | null },
  ): Promise<ConversationRecord | undefined> {
    const [record] = await db
      .update(conversation)
      .set(data)
      .where(eq(conversation.id, conversationId))
      .returning();
    return record;
  }

  async touchConversation(
    conversationId: string,
  ): Promise<ConversationRecord | undefined> {
    const [record] = await db
      .update(conversation)
      .set({ updatedAt: new Date() })
      .where(eq(conversation.id, conversationId))
      .returning();
    return record;
  }

  async deleteConversationRecord(conversationId: string): Promise<void> {
    await db
      .delete(conversation)
      .where(eq(conversation.id, conversationId));
  }
}

export const conversationRepository = new ConversationRepository();
export default ConversationRepository;
