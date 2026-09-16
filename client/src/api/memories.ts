import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  AppMemory,
  CreateMemoryInput,
  UpdateMemoryInput,
} from "@/types";

export const MEMORIES_KEY = ["memories"] as const;

import { isDemoMode } from "./auth";

const DEFAULT_DEMO_MEMORIES: AppMemory[] = [
  {
    id: "mem-1",
    memory: "Prefers formal tensor dimensionality in explanations (e.g. [B, H, S, D]) and explicit gradient derivations.",
    categories: ["RESEARCH_PREFERENCE"],
    source: "manual",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mem-2",
    memory: "Focusing on sparse attention mechanisms, KV-cache compression, and flash attention hardware optimizations.",
    categories: ["PROJECT_CONTEXT"],
    source: "learned",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mem-3",
    memory: "Requires exact document page numbers and direct quote excerpts for all generated claims and summaries.",
    categories: ["CITATION_RULE"],
    source: "manual",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getLocalMemories(): AppMemory[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_MEMORIES;
  const stored = localStorage.getItem("lumen_demo_memories");
  if (!stored) {
    localStorage.setItem("lumen_demo_memories", JSON.stringify(DEFAULT_DEMO_MEMORIES));
    return DEFAULT_DEMO_MEMORIES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_MEMORIES;
  }
}

function saveLocalMemories(list: AppMemory[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lumen_demo_memories", JSON.stringify(list));
  }
}

export async function getMemories(): Promise<AppMemory[]> {
  if (isDemoMode()) {
    return getLocalMemories();
  }
  try {
    const res = await apiClient.get<ApiResponse<AppMemory[]>>("/memories");
    return res.data.data;
  } catch (err) {
    return getLocalMemories();
  }
}

export async function createMemory(
  input: CreateMemoryInput,
): Promise<AppMemory> {
  const newMem: AppMemory = {
    id: `mem-${Date.now()}`,
    memory: input.memory,
    categories: ["GENERAL"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode()) {
    const list = [newMem, ...getLocalMemories()];
    saveLocalMemories(list);
    return newMem;
  }

  try {
    const res = await apiClient.post<ApiResponse<AppMemory>>("/memories", input);
    return res.data.data;
  } catch (err) {
    const list = [newMem, ...getLocalMemories()];
    saveLocalMemories(list);
    return newMem;
  }
}

export async function updateMemory(
  memoryId: string,
  input: UpdateMemoryInput,
): Promise<AppMemory> {
  if (isDemoMode()) {
    const list = getLocalMemories().map((m) =>
      m.id === memoryId ? { ...m, ...input, updatedAt: new Date().toISOString() } : m,
    );
    saveLocalMemories(list);
    return list.find((m) => m.id === memoryId)!;
  }
  try {
    const res = await apiClient.patch<ApiResponse<AppMemory>>(
      `/memories/${memoryId}`,
      input,
    );
    return res.data.data;
  } catch (err) {
    const list = getLocalMemories().map((m) =>
      m.id === memoryId ? { ...m, ...input, updatedAt: new Date().toISOString() } : m,
    );
    saveLocalMemories(list);
    return list.find((m) => m.id === memoryId)!;
  }
}

export async function deleteMemory(memoryId: string): Promise<void> {
  if (isDemoMode()) {
    const list = getLocalMemories().filter((m) => m.id !== memoryId);
    saveLocalMemories(list);
    return;
  }
  try {
    await apiClient.delete<ApiResponse<null>>(`/memories/${memoryId}`);
  } catch (err) {
    const list = getLocalMemories().filter((m) => m.id !== memoryId);
    saveLocalMemories(list);
  }
}

export function useMemories() {
  return useQuery({
    queryKey: MEMORIES_KEY,
    queryFn: getMemories,
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORIES_KEY });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      input,
    }: {
      memoryId: string;
      input: UpdateMemoryInput;
    }) => updateMemory(memoryId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORIES_KEY });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORIES_KEY });
    },
  });
}
