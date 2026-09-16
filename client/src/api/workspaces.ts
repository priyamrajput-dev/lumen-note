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

import { isDemoMode } from "./auth";

const DEFAULT_DEMO_WORKSPACES: Workspace[] = [
  {
    id: "ws-attention-1",
    userId: "demo-researcher-1",
    title: "Attention Mechanisms & Transformers",
    description: "Deep dive into multi-head attention, self-attention mechanisms, query-key-value routing, and positional encodings.",
    icon: "🧠",
    defaultModel: "gpt-4o-mini",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ws-quantum-2",
    userId: "demo-researcher-1",
    title: "Quantum Computing Fundamentals",
    description: "Qubit superposition, quantum entanglement, Shor's algorithm, and decoherence mitigation in superconducting systems.",
    icon: "⚛️",
    defaultModel: "gpt-4o",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ws-distributed-3",
    userId: "demo-researcher-1",
    title: "Distributed Consensus & Raft",
    description: "Leader election, replicated state machines, log compaction, and Paxos comparison.",
    icon: "🌐",
    defaultModel: "gpt-4o-mini",
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getLocalWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_WORKSPACES;
  const stored = localStorage.getItem("lumen_demo_workspaces");
  if (!stored) {
    localStorage.setItem("lumen_demo_workspaces", JSON.stringify(DEFAULT_DEMO_WORKSPACES));
    return DEFAULT_DEMO_WORKSPACES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_WORKSPACES;
  }
}

function saveLocalWorkspaces(list: Workspace[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lumen_demo_workspaces", JSON.stringify(list));
  }
}

export async function getWorkspaces(): Promise<Workspace[]> {
  if (isDemoMode()) {
    return getLocalWorkspaces();
  }
  try {
    const res = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");
    return res.data.data;
  } catch (err) {
    return getLocalWorkspaces();
  }
}

export async function getWorkspace(id: string): Promise<Workspace> {
  if (isDemoMode()) {
    const ws = getLocalWorkspaces().find((w) => w.id === id);
    if (ws) return ws;
    return getLocalWorkspaces()[0];
  }
  try {
    const res = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return res.data.data;
  } catch (err) {
    const ws = getLocalWorkspaces().find((w) => w.id === id);
    if (ws) return ws;
    return getLocalWorkspaces()[0];
  }
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  if (isDemoMode()) {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      userId: "demo-researcher-1",
      title: input.title,
      description: input.description || null,
      icon: input.icon || "🧠",
      defaultModel: input.defaultModel || "gpt-4o-mini",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newWs, ...getLocalWorkspaces()];
    saveLocalWorkspaces(list);
    return newWs;
  }
  try {
    const res = await apiClient.post<ApiResponse<Workspace>>("/workspaces", input);
    return res.data.data;
  } catch (err) {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      userId: "demo-researcher-1",
      title: input.title,
      description: input.description || null,
      icon: input.icon || "🧠",
      defaultModel: input.defaultModel || "gpt-4o-mini",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newWs, ...getLocalWorkspaces()];
    saveLocalWorkspaces(list);
    return newWs;
  }
}

export async function updateWorkspace(
  id: string,
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  if (isDemoMode()) {
    const list = getLocalWorkspaces().map((w) =>
      w.id === id ? { ...w, ...input, updatedAt: new Date().toISOString() } : w,
    );
    saveLocalWorkspaces(list);
    return list.find((w) => w.id === id)!;
  }
  try {
    const res = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${id}`, input);
    return res.data.data;
  } catch (err) {
    const list = getLocalWorkspaces().map((w) =>
      w.id === id ? { ...w, ...input, updatedAt: new Date().toISOString() } : w,
    );
    saveLocalWorkspaces(list);
    return list.find((w) => w.id === id)!;
  }
}

export async function deleteWorkspace(id: string): Promise<void> {
  if (isDemoMode()) {
    const list = getLocalWorkspaces().filter((w) => w.id !== id);
    saveLocalWorkspaces(list);
    return;
  }
  try {
    await apiClient.delete<ApiResponse<null>>(`/workspaces/${id}`);
  } catch (err) {
    const list = getLocalWorkspaces().filter((w) => w.id !== id);
    saveLocalWorkspaces(list);
  }
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
