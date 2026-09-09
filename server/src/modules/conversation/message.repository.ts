import { asc, count, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { message } from "../../db/schema/conversation.js";

export type MessageRecord = typeof message.$inferSelect;
export type CreateMessageData = typeof message.$inferInsert;

class MessageRepository {
  async findMessagesByConversationId(
    conversationId: string,
  ): Promise<MessageRecord[]> {
    return await db
      .select()
      .from(message)
      .where(eq(message.conversationId, conversationId))
      .orderBy(asc(message.createdAt));
  }

  async countMessagesByConversationId(
    conversationId: string,
  ): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(message)
      .where(eq(message.conversationId, conversationId));

    return result ? Number(result.val) : 0;
  }

  async createMessageRecord(
    data: CreateMessageData,
  ): Promise<MessageRecord> {
    const [record] = await db.insert(message).values(data).returning();
    return record;
  }
}

export const messageRepository = new MessageRepository();
export default MessageRepository;
