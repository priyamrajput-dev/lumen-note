import { MemoryClient } from "mem0ai";
import { env } from "../common/config/env.js";

let client: MemoryClient | null = null;

export function getMem0Client(): MemoryClient {
  const apiKey = env.MEM0_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("MEM0_API_KEY is not configured");
  }

  if (!client) {
    client = new MemoryClient({ apiKey });
  }

  return client;
}

export type Mem0Message = {
  role: "user" | "assistant";
  content: string;
};

export type AppMemory = {
  id: string;
  memory: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
  source: "manual" | "learned";
};

function mapMemory(record: {
  id: string;
  memory?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
}): AppMemory {
  const metadata = record.metadata ?? null;
  const source: AppMemory["source"] =
    metadata?.source === "manual" ? "manual" : "learned";
  const createdAt = record.createdAt ?? new Date().toISOString();
  const updatedAt = record.updatedAt ?? createdAt;

  return {
    id: record.id,
    memory: record.memory ?? "",
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt),
    metadata,
    categories: record.categories,
    source,
  };
}

export async function listUserMemories(userId: string): Promise<AppMemory[]> {
  if (!env.MEM0_API_KEY?.trim()) {
    return [];
  }

  const page = await getMem0Client().getAll({
    filters: { user_id: userId },
    page: 1,
    pageSize: 100,
  });

  return (page.results ?? []).map(mapMemory);
}

export async function searchUserMemories(
  userId: string,
  query: string,
): Promise<AppMemory[]> {
  if (!env.MEM0_API_KEY?.trim() || !query.trim()) {
    return [];
  }

  const results = await getMem0Client().search(query, {
    filters: { user_id: userId },
    topK: 8,
    threshold: 0.1,
  });

  return (results.results ?? []).map(mapMemory);
}

export async function addUserMemory(
  userId: string,
  input: {
    memory: string;
    infer?: boolean;
    metadata?: Record<string, unknown>;
  },
): Promise<AppMemory> {
  if (!env.MEM0_API_KEY?.trim()) {
    return {
      id: "mem-" + Date.now(),
      memory: input.memory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: input.metadata ?? null,
      source: "manual",
    };
  }

  const created = await getMem0Client().add(
    [{ role: "user", content: input.memory }],
    {
      user_id: userId,
      metadata: input.metadata,
    },
  );

  if (Array.isArray(created) && created[0]) {
    return mapMemory(created[0]);
  }

  const eventId =
    (created as { eventId?: string; id?: string })?.eventId ||
    (created as { id?: string })?.id ||
    "mem-" + Date.now();

  return {
    id: eventId,
    memory: input.memory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: input.metadata ?? null,
    source: "manual",
  };
}

export async function addMemoriesFromMessages(
  userId: string,
  messages: Mem0Message[],
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!env.MEM0_API_KEY?.trim() || messages.length === 0) {
    return;
  }

  await getMem0Client().add(messages, {
    user_id: userId,
    metadata,
  });
}

export async function updateUserMemory(
  memoryId: string,
  input: { memory: string },
): Promise<AppMemory> {
  if (!env.MEM0_API_KEY?.trim()) {
    return {
      id: memoryId,
      memory: input.memory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "manual",
    };
  }

  const updated = await getMem0Client().update(memoryId, {
    text: input.memory,
  });

  if (Array.isArray(updated) && updated[0]) {
    return mapMemory(updated[0]);
  }

  return {
    id: memoryId,
    memory: input.memory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "manual",
  };
}

export async function deleteUserMemory(memoryId: string): Promise<void> {
  if (!env.MEM0_API_KEY?.trim()) {
    return;
  }

  try {
    await getMem0Client().delete(memoryId);
  } catch (err) {
    console.warn("Mem0 delete note:", err);
  }
}

