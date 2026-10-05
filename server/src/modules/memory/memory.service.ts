import {
  addUserMemory,
  deleteUserMemory,
  listUserMemories,
  updateUserMemory,
  type AppMemory,
} from "../../lib/mem0.js";
import { buildCacheKey, getOrSetCache, delCache } from "../../lib/cache.js";

export async function listMemoriesForUser(userId: string): Promise<AppMemory[]> {
  const key = buildCacheKey("memories", userId);
  return getOrSetCache(key, 300, () => listUserMemories(userId));
}

export async function createMemoryForUser(
  userId: string,
  input: { memory: string },
) {
  const result = await addUserMemory(userId, {
    memory: input.memory,
    infer: false,
    metadata: { source: "manual" },
  });
  await delCache(buildCacheKey("memories", userId));
  return result;
}

export async function updateMemoryForUser(
  userId: string,
  memoryId: string,
  input: { memory: string },
) {
  const result = await updateUserMemory(memoryId, input);
  await delCache(buildCacheKey("memories", userId));
  return result;
}

export async function deleteMemoryForUser(userId: string, memoryId: string) {
  await deleteUserMemory(memoryId);
  await delCache(buildCacheKey("memories", userId));
}
