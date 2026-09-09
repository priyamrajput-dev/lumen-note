import {
  pgEnum,
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace.js";

export const artifactTypeEnum = pgEnum("artifact_type", [
  "SUMMARY",
  "TAKEAWAYS",
  "FLASHCARDS",
  "QUIZ",
  "MINDMAP",
  "REPORT",
]);

export const artifactStatusEnum = pgEnum("artifact_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export const learningArtifact = pgTable(
  "learning_artifact",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
      }),

    type: artifactTypeEnum("type").notNull(),

    title: text("title").notNull(),

    content: jsonb("content"),

    sourceIds: text("source_ids").array().default([]).notNull(),

    status: artifactStatusEnum("status").default("PENDING").notNull(),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("learning_artifact_workspace_id_idx").on(table.workspaceId),
    index("learning_artifact_workspace_id_type_idx").on(
      table.workspaceId,
      table.type,
    ),
    index("learning_artifact_workspace_id_status_idx").on(
      table.workspaceId,
      table.status,
    ),
  ],
);
