import { z } from "zod";

export const memoryIdParamSchema = z.object({
  memoryId: z.string().trim().min(1),
});

export const createMemorySchema = z.object({
  memory: z.string().trim().min(1).max(2000),
});

export const updateMemorySchema = z.object({
  memory: z.string().trim().min(1).max(2000),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
