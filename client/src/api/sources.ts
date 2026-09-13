import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  BulkDeleteSourcesInput,
  CreateTextSourceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  Source,
  SourceStatus,
  SourceType,
} from "@/types";

export interface SourceFilters {
  q?: string;
  type?: SourceType;
  status?: SourceStatus;
}

export const sourcesKey = (workspaceId: string, filters?: SourceFilters) =>
  ["workspaces", workspaceId, "sources", filters] as const;

export const sourceDetailKey = (workspaceId: string, sourceId: string) =>
  ["workspaces", workspaceId, "sources", sourceId] as const;

export async function getSources(
  workspaceId: string,
  filters?: SourceFilters,
): Promise<Source[]> {
  const params: Record<string, string> = {};
  if (filters?.q) params.q = filters.q;
  if (filters?.type) params.type = filters.type;
  if (filters?.status) params.status = filters.status;

  const res = await apiClient.get<ApiResponse<Source[]>>(
    `/workspaces/${workspaceId}/sources`,
    { params },
  );
  return res.data.data;
}

export async function getSource(
  workspaceId: string,
  sourceId: string,
): Promise<Source> {
  const res = await apiClient.get<ApiResponse<Source>>(
    `/workspaces/${workspaceId}/sources/${sourceId}`,
  );
  return res.data.data;
}

export async function createTextSource(
  workspaceId: string,
  input: CreateTextSourceInput,
): Promise<Source> {
  const res = await apiClient.post<ApiResponse<Source>>(
    `/workspaces/${workspaceId}/sources`,
    input,
  );
  return res.data.data;
}

export async function uploadPdfSource(
  workspaceId: string,
  file: File,
  title?: string,
): Promise<Source> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await apiClient.post<ApiResponse<Source>>(
    `/workspaces/${workspaceId}/sources/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data.data;
}

export async function importWebsiteSource(
  workspaceId: string,
  input: ImportWebsiteInput,
): Promise<Source> {
  const res = await apiClient.post<ApiResponse<Source>>(
    `/workspaces/${workspaceId}/sources/import/website`,
    input,
  );
  return res.data.data;
}

export async function importYoutubeSource(
  workspaceId: string,
  input: ImportYoutubeInput,
): Promise<Source> {
  const res = await apiClient.post<ApiResponse<Source>>(
    `/workspaces/${workspaceId}/sources/import/youtube`,
    input,
  );
  return res.data.data;
}

export async function deleteSource(
  workspaceId: string,
  sourceId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/workspaces/${workspaceId}/sources/${sourceId}`,
  );
}

export async function bulkDeleteSources(
  workspaceId: string,
  input: BulkDeleteSourcesInput,
): Promise<void> {
  await apiClient.post<ApiResponse<null>>(
    `/workspaces/${workspaceId}/sources/bulk-delete`,
    input,
  );
}

export function useSources(workspaceId?: string, filters?: SourceFilters) {
  return useQuery({
    queryKey: sourcesKey(workspaceId ?? "", filters),
    queryFn: () => getSources(workspaceId!, filters),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some(
        (s) => s.status === "PENDING" || s.status === "PROCESSING",
      );
      return hasPending ? 2500 : false;
    },
  });
}

export function useSource(workspaceId?: string, sourceId?: string) {
  return useQuery({
    queryKey: sourceDetailKey(workspaceId ?? "", sourceId ?? ""),
    queryFn: () => getSource(workspaceId!, sourceId!),
    enabled: !!workspaceId && !!sourceId,
  });
}

export function useCreateTextSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTextSourceInput) =>
      createTextSource(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}

export function useUploadPdfSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      uploadPdfSource(workspaceId, file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}

export function useImportWebsiteSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportWebsiteInput) =>
      importWebsiteSource(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}

export function useImportYoutubeSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportYoutubeInput) =>
      importYoutubeSource(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}

export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => deleteSource(workspaceId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}

export function useBulkDeleteSources(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkDeleteSourcesInput) =>
      bulkDeleteSources(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sources"],
      });
    },
  });
}
