import {
  pgEnum,
  pgTable,
  text,
  uuid,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace.js";

export const messageRoleEnum = pgEnum("message_role", ["USER", "ASSISTANT"]);

export const conversation = pgTable(
  "conversation",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
      }),

    title: text("title"),

    summary: text("summary"),

    summaryMessageCount: integer("summary_message_count").default(0).notNull(),

    summarizedAt: timestamp("summarized_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("conversation_workspace_id_idx").on(table.workspaceId),
    index("conversation_workspace_id_updated_at_idx").on(
      table.workspaceId,
      table.updatedAt,
    ),
  ],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, {
        onDelete: "cascade",
      }),

    role: messageRoleEnum("role").notNull(),

    content: text("content").notNull(),

    citations: jsonb("citations"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_conversation_id_idx").on(table.conversationId),
    index("message_conversation_id_created_at_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);
