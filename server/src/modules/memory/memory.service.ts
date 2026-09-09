import { addUserMemory, updateUserMemory } from "../../lib/mem0.js";

export function createMemoryForUser(
  userId: string,
  input: { memory: string },
) {
  return addUserMemory(userId, {
    memory: input.memory,
    infer: false,
    metadata: { source: "manual" },
  });
}

export function updateMemoryForUser(
  _userId: string,
  memoryId: string,
  input: { memory: string },
) {
  return updateUserMemory(memoryId, input);
}
