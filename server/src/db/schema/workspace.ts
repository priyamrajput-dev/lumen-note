import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const workspace = pgTable("workspace", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  icon: text("icon"),
  defaultModel: varchar("default_model", { length: 500 }).default("gpt-4o-mini"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

 