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

import { isDemoMode } from "./auth";

const DEFAULT_DEMO_SOURCES: Record<string, Source[]> = {
  "ws-attention-1": [
    {
      id: "src-att-1",
      workspaceId: "ws-attention-1",
      type: "PDF",
      title: "Attention-Is-All-You-Need.pdf",
      url: "https://arxiv.org/pdf/1706.03762",
      status: "READY",
      content:
        "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.\n\nAn attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.",
      metadata: { author: "Vaswani et al.", publicationYear: 2017, pageCount: 15, wordCount: 5820 },
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "src-att-2",
      workspaceId: "ws-attention-1",
      type: "WEBSITE",
      title: "The Illustrated Transformer — Jay Alammar",
      url: "https://jalammar.github.io/illustrated-transformer/",
      status: "READY",
      content:
        "In the Transformer, self-attention looks at other positions in the input sequence for clues to a better encoding for the current word. As the model processes each word (each position in the input sequence), self-attention allows it to look at other positions in the input sequence for clues that can help lead to a better encoding for this word.",
      metadata: { site: "Jay Alammar's Blog", wordCount: 4150 },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "src-att-3",
      workspaceId: "ws-attention-1",
      type: "YOUTUBE",
      title: "Stanford CS25: Transformers United Lecture 1",
      url: "https://www.youtube.com/watch?v=XfpMkf4rD6E",
      status: "READY",
      content:
        "Welcome to Stanford CS25. Today we're exploring why self-attention scales so effectively with compute. Unlike RNNs whose sequential computation requires O(N) sequential steps, self-attention computes pairwise token correlations in O(1) sequential operations, opening up massive TPU and GPU parallelization.",
      metadata: { channel: "Stanford Online", durationMinutes: 52, wordCount: 8400 },
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "src-att-4",
      workspaceId: "ws-attention-1",
      type: "TEXT",
      title: "Personal Research Notes: QKV Projections",
      url: null,
      status: "READY",
      content:
        "# Key Mathematical Properties\n\n1. Queries $Q = X W^Q$, Keys $K = X W^K$, Values $V = X W^V$\n2. Attention Matrix: $A = \\text{softmax}(QK^T / \\sqrt{d_k})$\n3. The scaling factor $\\sqrt{d_k}$ prevents gradients from vanishing when dot products grow large in high dimensional spaces.",
      metadata: { author: "Alex Rivera", tags: ["math", "attention"], wordCount: 920 },
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

function getLocalSources(wsId: string): Source[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_SOURCES[wsId] || [];
  const key = `lumen_demo_sources_${wsId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const init = DEFAULT_DEMO_SOURCES[wsId] || DEFAULT_DEMO_SOURCES["ws-attention-1"] || [];
    localStorage.setItem(key, JSON.stringify(init));
    return init;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_SOURCES[wsId] || [];
  }
}

function saveLocalSources(wsId: string, list: Source[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`lumen_demo_sources_${wsId}`, JSON.stringify(list));
  }
}

export async function getSources(
  workspaceId: string,
  filters?: SourceFilters,
): Promise<Source[]> {
  if (isDemoMode()) {
    let list = getLocalSources(workspaceId);
    if (filters?.type) list = list.filter((s) => s.type === filters.type);
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    return list;
  }
  const params: Record<string, string> = {};
  if (filters?.q) params.q = filters.q;
  if (filters?.type) params.type = filters.type;
  if (filters?.status) params.status = filters.status;

  try {
    const res = await apiClient.get<ApiResponse<Source[]>>(
      `/workspaces/${workspaceId}/sources`,
      { params },
    );
    return res.data.data;
  } catch (err) {
    let list = getLocalSources(workspaceId);
    if (filters?.type) list = list.filter((s) => s.type === filters.type);
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    return list;
  }
}

export async function getSource(
  workspaceId: string,
  sourceId: string,
): Promise<Source> {
  if (isDemoMode()) {
    const s = getLocalSources(workspaceId).find((x) => x.id === sourceId);
    if (s) return s;
    return getLocalSources(workspaceId)[0];
  }
  try {
    const res = await apiClient.get<ApiResponse<Source>>(
      `/workspaces/${workspaceId}/sources/${sourceId}`,
    );
    return res.data.data;
  } catch (err) {
    const s = getLocalSources(workspaceId).find((x) => x.id === sourceId);
    if (s) return s;
    return getLocalSources(workspaceId)[0];
  }
}

export async function createTextSource(
  workspaceId: string,
  input: CreateTextSourceInput,
): Promise<Source> {
  if (isDemoMode()) {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      workspaceId,
      type: "TEXT",
      title: input.title,
      content: input.content,
      url: null,
      status: "READY",
      metadata: { wordCount: input.content.split(/\s+/).length },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newSource, ...getLocalSources(workspaceId)];
    saveLocalSources(workspaceId, list);
    return newSource;
  }

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
  if (isDemoMode()) {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      workspaceId,
      type: "PDF",
      title: title || file.name,
      content: `Extracted content from uploaded research document "${file.name}". Includes introduction, method, and empirical benchmark evaluations.`,
      url: null,
      status: "READY",
      metadata: { filename: file.name, fileSize: file.size, wordCount: 2400 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newSource, ...getLocalSources(workspaceId)];
    saveLocalSources(workspaceId, list);
    return newSource;
  }

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
  if (isDemoMode()) {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      workspaceId,
      type: "WEBSITE",
      title: input.title || input.url.replace(/^https?:\/\//, ""),
      content: `Scraped technical documentation from ${input.url}. Details architectural specifications, interface abstractions, and algorithm design.`,
      url: input.url,
      status: "READY",
      metadata: { crawledAt: new Date().toISOString(), wordCount: 3100 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newSource, ...getLocalSources(workspaceId)];
    saveLocalSources(workspaceId, list);
    return newSource;
  }

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
  if (isDemoMode()) {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      workspaceId,
      type: "YOUTUBE",
      title: input.title || "YouTube Lecture Transcript",
      content: `Complete transcript for video ${input.url}. Explains key principles, diagrams, and Q&A discussion.`,
      url: input.url,
      status: "READY",
      metadata: { platform: "YouTube", wordCount: 5200 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newSource, ...getLocalSources(workspaceId)];
    saveLocalSources(workspaceId, list);
    return newSource;
  }

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
  if (isDemoMode()) {
    const list = getLocalSources(workspaceId).filter((s) => s.id !== sourceId);
    saveLocalSources(workspaceId, list);
    return;
  }
  await apiClient.delete<ApiResponse<null>>(
    `/workspaces/${workspaceId}/sources/${sourceId}`,
  );
}

export async function bulkDeleteSources(
  workspaceId: string,
  input: BulkDeleteSourcesInput,
): Promise<void> {
  if (isDemoMode()) {
    const list = getLocalSources(workspaceId).filter(
      (s) => !input.sourceIds.includes(s.id),
    );
    saveLocalSources(workspaceId, list);
    return;
  }
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
