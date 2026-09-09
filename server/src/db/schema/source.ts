import {
  pgEnum,
  pgTable,
  text,
  uuid,
  integer,
  jsonb,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace.js";

// Enums
export const sourceTypeEnum = pgEnum("source_type", [
  "PDF",
  "WEBSITE",
  "YOUTUBE",
  "TEXT",
  "MARKDOWN",
]);

export const sourceStatusEnum = pgEnum("source_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

// Source
export const source = pgTable(
  "source",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
      }),

    type: sourceTypeEnum("type").notNull(),

    title: text("title").notNull(),

    content: text("content"),

    url: text("url"),

    status: sourceStatusEnum("status").default("PENDING").notNull(),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },

  (table) => [
    index("source_workspace_id_idx").on(table.workspaceId),

    index("source_workspace_id_type_idx").on(table.workspaceId, table.type),

    index("source_workspace_id_status_idx").on(table.workspaceId, table.status),
  ],
);

// Source Chunk
export const sourceChunk = pgTable(
  "source_chunk",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    sourceId: uuid("source_id")
      .notNull()
      .references(() => source.id, {
        onDelete: "cascade",
      }),

    index: integer("index").notNull(),

    content: text("content").notNull(),

    tokenCount: integer("token_count"),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },

  (table) => [
    unique("source_chunk_source_id_index_unique").on(table.sourceId, table.index),

    index("source_chunk_source_id_idx").on(table.sourceId),
  ],
);
