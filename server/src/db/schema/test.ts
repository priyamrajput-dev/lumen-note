import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const testSchema = pgTable("test", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }),
});
