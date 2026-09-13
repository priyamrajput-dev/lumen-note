import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Workspace,
} from "@/types";

export const WORKSPACES_KEY = ["workspaces"] as const;
export const workspaceKey = (id: string) => ["workspaces", id] as const;

export async function getWorkspaces(): Promise<Workspace[]> {
  const res = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");
  return res.data.data;
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const res = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
  return res.data.data;
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const res = await apiClient.post<ApiResponse<Workspace>>("/workspaces", input);
  return res.data.data;
}

export async function updateWorkspace(
  id: string,
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  const res = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${id}`, input);
  return res.data.data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/workspaces/${id}`);
}

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: getWorkspaces,
  });
}

export function useWorkspace(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKey(workspaceId ?? ""),
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkspaceInput }) =>
      updateWorkspace(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY });
      queryClient.invalidateQueries({ queryKey: workspaceKey(variables.id) });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY });
      queryClient.removeQueries({ queryKey: workspaceKey(deletedId) });
    },
  });
}
