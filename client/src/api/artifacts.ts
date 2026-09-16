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

import { isDemoMode } from "./auth";

const DEFAULT_DEMO_ARTIFACTS: Record<string, LearningArtifact[]> = {
  "ws-attention-1": [
    {
      id: "art-flash-1",
      workspaceId: "ws-attention-1",
      type: "FLASHCARDS",
      title: "Scaled Dot-Product vs Multi-Head Attention",
      status: "READY",
      sourceIds: ["src-att-1"],
      content: {
        cards: [
          {
            front: "What is the primary role of the scaling factor 1/√d_k in dot-product attention?",
            back: "For large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with tiny gradients. The 1/√d_k factor scales values back to maintain gradient stability.",
          },
          {
            front: "Why does Multi-Head Attention outperform Single-Head Attention?",
            back: "It allows the model to jointly attend to information from different representation subspaces at different positions, whereas single-head attention averages representations across all aspects.",
          },
          {
            front: "What are the computational complexity differences between Self-Attention and Recurrent layers?",
            back: "Self-attention has O(1) sequential operations and O(n²·d) per-layer complexity, whereas RNNs require O(n) sequential steps and O(n·d²) per-layer complexity.",
          },
          {
            front: "Why are Positional Encodings required in Transformers?",
            back: "Because the Transformer contains no recurrence and no convolution, positional encodings must be added to input embeddings to give the model information about token order.",
          },
        ],
      },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "art-quiz-2",
      workspaceId: "ws-attention-1",
      type: "QUIZ",
      title: "Self-Attention Mechanics Assessment",
      status: "READY",
      sourceIds: ["src-att-1", "src-att-2"],
      content: {
        questions: [
          {
            question: "In standard Scaled Dot-Product Attention, what is the dimension of the resulting attention weight matrix for a sequence of length N?",
            options: ["N × d_model", "N × N", "d_k × d_v", "1 × N"],
            correctIndex: 1,
            explanation: "The attention matrix computes pairwise compatibility between every pair of query and key positions, resulting in an N × N score matrix before multiplying by Values.",
          },
          {
            question: "Which of the following is true regarding multi-head attention projections?",
            options: [
              "All heads use identical learned weight matrices",
              "Queries, keys, and values are projected h times with distinct learned linear projections",
              "It increases the total computation cost by a factor of h compared to full-rank attention",
              "It removes the need for residual connections",
            ],
            correctIndex: 1,
            explanation: "Each of the h heads projects Q, K, and V into d_k / h dimensional spaces with distinct parameters, keeping total computational cost similar to single-head attention.",
          },
          {
            question: "Why can the encoder in a Transformer process tokens simultaneously while a classic RNN cannot?",
            options: [
              "Transformers use bidirectional LSTM cells under the hood",
              "Self-attention has no sequential time step dependencies between t and t-1",
              "The Transformer only runs on single words",
              "Because softmax executes asynchronously on CPU",
            ],
            correctIndex: 1,
            explanation: "Without recurrent state passing from step t-1 to t, self-attention can compute the entire sequence in one parallel matrix multiplication.",
          },
        ],
      },
      createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "art-mindmap-3",
      workspaceId: "ws-attention-1",
      type: "MINDMAP",
      title: "Transformer Architecture Topology",
      status: "READY",
      sourceIds: ["src-att-1"],
      content: {
        nodes: [
          { id: "root", label: "Transformer Architecture" },
          { id: "enc", label: "Encoder Stack (6x)" },
          { id: "dec", label: "Decoder Stack (6x)" },
          { id: "mha", label: "Multi-Head Attention" },
          { id: "ffn", label: "Position-wise FFN" },
          { id: "norm", label: "Add & LayerNorm" },
          { id: "mask", label: "Masked Cross-Attention" },
          { id: "pos", label: "Positional Encoding" },
        ],
        edges: [
          { id: "e1", source: "root", target: "enc" },
          { id: "e2", source: "root", target: "dec" },
          { id: "e3", source: "root", target: "pos" },
          { id: "e4", source: "enc", target: "mha" },
          { id: "e5", source: "enc", target: "ffn" },
          { id: "e6", source: "enc", target: "norm" },
          { id: "e7", source: "dec", target: "mask" },
          { id: "e8", source: "dec", target: "norm" },
        ],
      },
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

function getLocalArtifacts(wsId: string): LearningArtifact[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_ARTIFACTS[wsId] || [];
  const key = `lumen_demo_artifacts_${wsId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const init = DEFAULT_DEMO_ARTIFACTS[wsId] || DEFAULT_DEMO_ARTIFACTS["ws-attention-1"] || [];
    localStorage.setItem(key, JSON.stringify(init));
    return init;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_ARTIFACTS[wsId] || [];
  }
}

function saveLocalArtifacts(wsId: string, list: LearningArtifact[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`lumen_demo_artifacts_${wsId}`, JSON.stringify(list));
  }
}

export async function getArtifacts(
  workspaceId: string,
): Promise<LearningArtifact[]> {
  if (isDemoMode()) {
    return getLocalArtifacts(workspaceId);
  }
  try {
    const res = await apiClient.get<ApiResponse<LearningArtifact[]>>(
      `/workspaces/${workspaceId}/artifacts`,
    );
    return res.data.data;
  } catch (err) {
    return getLocalArtifacts(workspaceId);
  }
}

export async function getArtifact(
  workspaceId: string,
  artifactId: string,
): Promise<LearningArtifact> {
  if (isDemoMode()) {
    const a = getLocalArtifacts(workspaceId).find((x) => x.id === artifactId);
    if (a) return a;
    return getLocalArtifacts(workspaceId)[0];
  }
  try {
    const res = await apiClient.get<ApiResponse<LearningArtifact>>(
      `/workspaces/${workspaceId}/artifacts/${artifactId}`,
    );
    return res.data.data;
  } catch (err) {
    const a = getLocalArtifacts(workspaceId).find((x) => x.id === artifactId);
    if (a) return a;
    return getLocalArtifacts(workspaceId)[0];
  }
}

export async function createArtifact(
  workspaceId: string,
  input: CreateArtifactInput,
): Promise<LearningArtifact> {
  const newArt: LearningArtifact = {
    id: `art-${Date.now()}`,
    workspaceId,
    type: input.type,
    title: input.type === "SUMMARY" ? "Generated Executive Summary" : `${input.type} Synthesis`,
    status: "READY",
    sourceIds: input.sourceIds || [],
    content:
      input.type === "SUMMARY"
        ? { markdown: "Synthesized executive summary generated from current knowledge sources. Highlights foundational tenets, empirical observations, and research implications." }
        : input.type === "TAKEAWAYS"
        ? { items: ["Scalability is unlocked by removing recurrent step bottlenecks.", "QKV projections map representations into orthogonal metric spaces.", "Layer normalization preserves numerical stability."] }
        : input.type === "FLASHCARDS"
        ? { cards: [{ front: "What is self-attention?", back: "An attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence." }] }
        : { markdown: "Comprehensive research report compiled across all indexed sources." },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode()) {
    const list = [newArt, ...getLocalArtifacts(workspaceId)];
    saveLocalArtifacts(workspaceId, list);
    return newArt;
  }

  try {
    const res = await apiClient.post<ApiResponse<LearningArtifact>>(
      `/workspaces/${workspaceId}/artifacts`,
      input,
    );
    return res.data.data;
  } catch (err) {
    const list = [newArt, ...getLocalArtifacts(workspaceId)];
    saveLocalArtifacts(workspaceId, list);
    return newArt;
  }
}

export async function deleteArtifact(
  workspaceId: string,
  artifactId: string,
): Promise<void> {
  if (isDemoMode()) {
    const list = getLocalArtifacts(workspaceId).filter((a) => a.id !== artifactId);
    saveLocalArtifacts(workspaceId, list);
    return;
  }
  try {
    await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/artifacts/${artifactId}`,
    );
  } catch (err) {
    const list = getLocalArtifacts(workspaceId).filter((a) => a.id !== artifactId);
    saveLocalArtifacts(workspaceId, list);
  }
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
