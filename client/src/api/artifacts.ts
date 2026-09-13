import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  CreateArtifactInput,
  LearningArtifact,
} from "@/types";

export const artifactsKey = (workspaceId: string) =>
  ["workspaces", workspaceId, "artifacts"] as const;

export const artifactDetailKey = (workspaceId: string, artifactId: string) =>
  ["workspaces", workspaceId, "artifacts", artifactId] as const;

export async function getArtifacts(
  workspaceId: string,
): Promise<LearningArtifact[]> {
  const res = await apiClient.get<ApiResponse<LearningArtifact[]>>(
    `/workspaces/${workspaceId}/artifacts`,
  );
  return res.data.data;
}

export async function getArtifact(
  workspaceId: string,
  artifactId: string,
): Promise<LearningArtifact> {
  const res = await apiClient.get<ApiResponse<LearningArtifact>>(
    `/workspaces/${workspaceId}/artifacts/${artifactId}`,
  );
  return res.data.data;
}

export async function createArtifact(
  workspaceId: string,
  input: CreateArtifactInput,
): Promise<LearningArtifact> {
  const res = await apiClient.post<ApiResponse<LearningArtifact>>(
    `/workspaces/${workspaceId}/artifacts`,
    input,
  );
  return res.data.data;
}

export async function deleteArtifact(
  workspaceId: string,
  artifactId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/workspaces/${workspaceId}/artifacts/${artifactId}`,
  );
}

export function useArtifacts(workspaceId?: string) {
  return useQuery({
    queryKey: artifactsKey(workspaceId ?? ""),
    queryFn: () => getArtifacts(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some(
        (a) => a.status === "PENDING" || a.status === "PROCESSING",
      );
      return hasPending ? 2500 : false;
    },
  });
}

export function useArtifact(workspaceId?: string, artifactId?: string) {
  return useQuery({
    queryKey: artifactDetailKey(workspaceId ?? "", artifactId ?? ""),
    queryFn: () => getArtifact(workspaceId!, artifactId!),
    enabled: !!workspaceId && !!artifactId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "PENDING" || data.status === "PROCESSING")) {
        return 2000;
      }
      return false;
    },
  });
}

export function useCreateArtifact(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateArtifactInput) => createArtifact(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: artifactsKey(workspaceId),
      });
    },
  });
}

export function useDeleteArtifact(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (artifactId: string) => deleteArtifact(workspaceId, artifactId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: artifactsKey(workspaceId),
      });
    },
  });
}
