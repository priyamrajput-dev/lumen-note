import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  AppMemory,
  CreateMemoryInput,
  UpdateMemoryInput,
} from "@/types";

export const MEMORIES_KEY = ["memories"] as const;

export async function getMemories(): Promise<AppMemory[]> {
  const res = await apiClient.get<ApiResponse<AppMemory[]>>("/memories");
  return res.data.data;
}

export async function createMemory(
  input: CreateMemoryInput,
): Promise<AppMemory> {
  const res = await apiClient.post<ApiResponse<AppMemory>>("/memories", input);
  return res.data.data;
}

export async function updateMemory(
  memoryId: string,
  input: UpdateMemoryInput,
): Promise<AppMemory> {
  const res = await apiClient.patch<ApiResponse<AppMemory>>(
    `/memories/${memoryId}`,
    input,
  );
  return res.data.data;
}

export async function deleteMemory(memoryId: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/memories/${memoryId}`);
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
