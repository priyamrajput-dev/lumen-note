import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ApiResponse,
  ChatModel,
  Conversation,
  Message,
} from "@/types";

export const conversationsKey = (workspaceId: string) =>
  ["workspaces", workspaceId, "conversations"] as const;

export const messagesKey = (workspaceId: string, conversationId: string) =>
  ["workspaces", workspaceId, "conversations", conversationId, "messages"] as const;

import { isDemoMode } from "./auth";

const DEFAULT_DEMO_CONVERSATIONS: Record<string, Conversation[]> = {
  "ws-attention-1": [
    {
      id: "conv-1",
      workspaceId: "ws-attention-1",
      title: "Self-Attention vs Recurrence",
      summaryMessageCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const DEFAULT_DEMO_MESSAGES: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      role: "USER",
      content: "How does multi-head self-attention overcome sequential bottlenecks in recurrence?",
      citations: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      role: "ASSISTANT",
      content: "Multi-head attention dispenses entirely with recurrence, computing representations in parallel across sequence positions. By mapping queries, keys, and values into multiple distinct projection subspaces [1], the model jointly attends to information from different representation positions [2].\n\nBecause there is no step-by-step sequential propagation like in an LSTM, training can be parallelized completely across GPU and TPU clusters.",
      citations: [
        {
          sourceId: "src-att-1",
          sourceTitle: "Attention-Is-All-You-Need.pdf",
          sourceType: "PDF",
          page: 4,
          score: 0.94,
          excerpt: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.",
        },
        {
          sourceId: "src-att-2",
          sourceTitle: "The Illustrated Transformer — Jay Alammar",
          sourceType: "WEBSITE",
          page: 1,
          score: 0.88,
          excerpt: "Self-attention looks at other positions in the input sequence for clues to a better encoding for the current word.",
        },
      ],
      createdAt: new Date(Date.now() - 3500000).toISOString(),
    },
  ],
};

function getLocalConversations(wsId: string): Conversation[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_CONVERSATIONS[wsId] || [];
  const key = `lumen_demo_conversations_${wsId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const init = DEFAULT_DEMO_CONVERSATIONS[wsId] || [
      {
        id: "conv-1",
        workspaceId: wsId,
        title: "Research Exploration",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(key, JSON.stringify(init));
    return init;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_CONVERSATIONS[wsId] || [];
  }
}

function getLocalMessages(convId: string): Message[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_MESSAGES[convId] || [];
  const key = `lumen_demo_messages_${convId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const init = DEFAULT_DEMO_MESSAGES[convId] || DEFAULT_DEMO_MESSAGES["conv-1"] || [];
    localStorage.setItem(key, JSON.stringify(init));
    return init;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DEMO_MESSAGES[convId] || [];
  }
}

export function appendLocalMessage(convId: string, msg: Message): void {
  if (typeof window !== "undefined") {
    const list = [...getLocalMessages(convId), msg];
    localStorage.setItem(`lumen_demo_messages_${convId}`, JSON.stringify(list));
  }
}

export async function getConversations(
  workspaceId: string,
): Promise<Conversation[]> {
  if (isDemoMode()) {
    return getLocalConversations(workspaceId);
  }
  try {
    const res = await apiClient.get<ApiResponse<Conversation[]>>(
      `/workspaces/${workspaceId}/chat/conversations`,
    );
    return res.data.data;
  } catch (err) {
    return getLocalConversations(workspaceId);
  }
}

export async function createConversation(
  workspaceId: string,
  title?: string,
): Promise<Conversation> {
  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    workspaceId,
    title: title || "New Research Thread",
    summaryMessageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode()) {
    const list = [newConv, ...getLocalConversations(workspaceId)];
    if (typeof window !== "undefined") {
      localStorage.setItem(`lumen_demo_conversations_${workspaceId}`, JSON.stringify(list));
    }
    return newConv;
  }

  try {
    const res = await apiClient.post<ApiResponse<Conversation>>(
      `/workspaces/${workspaceId}/chat/conversations`,
      { title },
    );
    return res.data.data;
  } catch (err) {
    const list = [newConv, ...getLocalConversations(workspaceId)];
    if (typeof window !== "undefined") {
      localStorage.setItem(`lumen_demo_conversations_${workspaceId}`, JSON.stringify(list));
    }
    return newConv;
  }
}

export async function getMessages(
  workspaceId: string,
  conversationId: string,
): Promise<Message[]> {
  if (isDemoMode()) {
    return getLocalMessages(conversationId);
  }
  try {
    const res = await apiClient.get<ApiResponse<Message[]>>(
      `/workspaces/${workspaceId}/chat/conversations/${conversationId}/messages`,
    );
    return res.data.data;
  } catch (err) {
    return getLocalMessages(conversationId);
  }
}

export async function deleteConversation(
  workspaceId: string,
  conversationId: string,
): Promise<void> {
  if (isDemoMode()) {
    const list = getLocalConversations(workspaceId).filter((c) => c.id !== conversationId);
    if (typeof window !== "undefined") {
      localStorage.setItem(`lumen_demo_conversations_${workspaceId}`, JSON.stringify(list));
    }
    return;
  }
  try {
    await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/chat/conversations/${conversationId}`,
    );
  } catch (err) {
    const list = getLocalConversations(workspaceId).filter((c) => c.id !== conversationId);
    if (typeof window !== "undefined") {
      localStorage.setItem(`lumen_demo_conversations_${workspaceId}`, JSON.stringify(list));
    }
  }
}

export function useConversations(workspaceId?: string) {
  return useQuery({
    queryKey: conversationsKey(workspaceId ?? ""),
    queryFn: () => getConversations(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useMessages(workspaceId?: string, conversationId?: string) {
  return useQuery({
    queryKey: messagesKey(workspaceId ?? "", conversationId ?? ""),
    queryFn: () => getMessages(workspaceId!, conversationId!),
    enabled: !!workspaceId && !!conversationId,
  });
}

export function useCreateConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => createConversation(workspaceId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationsKey(workspaceId),
      });
    },
  });
}

export function useDeleteConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteConversation(workspaceId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationsKey(workspaceId),
      });
    },
  });
}

export interface StreamChatOptions {
  workspaceId: string;
  conversationId?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  model?: ChatModel;
  webSearch?: boolean;
  onChunk: (delta: string) => void;
  onConversationResolved?: (id: string) => void;
  onFinish?: (fullText: string) => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

/**
 * Streams chat completion from the Lumen Note backend.
 * Parses AI SDK UI message stream and extracts text deltas.
 */
export async function streamChat({
  workspaceId,
  conversationId,
  messages,
  model,
  webSearch,
  onChunk,
  onConversationResolved,
  onFinish,
  onError,
  signal,
}: StreamChatOptions): Promise<string> {
  const lastUserMsg = messages[messages.length - 1]?.content || "";

  if (isDemoMode()) {
    const convId = conversationId || "conv-1";
    onConversationResolved?.(convId);

    const simulationReply = `Based on your indexed research material, specifically **Attention-Is-All-You-Need.pdf** [1] and **Stanford CS25** [2]:\n\n1. **Parallel Computation**: The self-attention mechanism dispenses with recurrence entirely, computing compatibility between all token pairs simultaneously in $O(1)$ sequential operations.\n2. **Subspace Representations**: By projecting queries, keys, and values into multiple projection subspaces ($h=8$), the model attends to information from distinct representation subspaces at different positions [1].\n\nThis provides both significant speedup during training and superior cross-sentence relational fidelity.`;

    const words = simulationReply.split(" ");
    let accumulated = "";
    for (const word of words) {
      if (signal?.aborted) break;
      const chunk = word + " ";
      accumulated += chunk;
      onChunk(chunk);
      await new Promise((r) => setTimeout(r, 35));
    }

    appendLocalMessage(convId, {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      role: "ASSISTANT",
      content: accumulated,
      citations: [
        {
          sourceId: "src-att-1",
          sourceTitle: "Attention-Is-All-You-Need.pdf",
          sourceType: "PDF",
          page: 4,
          score: 0.94,
          excerpt: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
        },
      ],
      createdAt: new Date().toISOString(),
    });

    onFinish?.(accumulated);
    return accumulated;
  }
  try {
    const formattedMessages = messages.map((m, idx) => ({
      id: `msg-${idx}-${Date.now()}`,
      role: m.role,
      content: m.content,
      parts: [{ type: "text", text: m.content }],
    }));

    const baseUrl = apiClient.defaults.baseURL || "/api";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lumen_auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/chat`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        conversationId: conversationId || undefined,
        messages: formattedMessages,
        model,
        webSearch: !!webSearch,
      }),
      signal,
    });

    const setAuthToken = response.headers.get("set-auth-token");
    if (setAuthToken && typeof window !== "undefined") {
      localStorage.setItem("lumen_auth_token", setAuthToken);
    }

    if (!response.ok) {
      let errMessage = `Chat request failed (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error) errMessage = errJson.error;
        else if (errJson.message) errMessage = errJson.message;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errMessage);
    }

    const resolvedConvId = response.headers.get("X-Conversation-Id");
    if (resolvedConvId && onConversationResolved) {
      onConversationResolved(resolvedConvId);
    }

    if (!response.body) {
      throw new Error("No response body received from chat stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const textChunk = decoder.decode(value, { stream: true });
      buffer += textChunk;

      const lines = buffer.split("\n");
      // Keep last incomplete line in buffer
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // 1. Standard Server-Sent Events (data: ...)
        if (trimmed.startsWith("data:")) {
          const sseData = trimmed.slice(5).trim();
          if (sseData === "[DONE]") continue;

          try {
            const parsed = JSON.parse(sseData);
            if (typeof parsed === "string") {
              accumulatedText += parsed;
              onChunk(parsed);
            } else if (parsed && typeof parsed === "object") {
              if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
                accumulatedText += parsed.delta;
                onChunk(parsed.delta);
              } else if (typeof parsed.delta === "string") {
                accumulatedText += parsed.delta;
                onChunk(parsed.delta);
              } else if (typeof parsed.text === "string") {
                accumulatedText += parsed.text;
                onChunk(parsed.text);
              } else if (typeof parsed.content === "string") {
                accumulatedText += parsed.content;
                onChunk(parsed.content);
              }
            }
          } catch {
            if (sseData) {
              accumulatedText += sseData;
              onChunk(sseData);
            }
          }
        } else if (trimmed.startsWith("0:")) {
          // 2. AI SDK direct line format (0:"...")
          try {
            const rawContent = trimmed.slice(2);
            const parsed = JSON.parse(rawContent);
            if (typeof parsed === "string") {
              accumulatedText += parsed;
              onChunk(parsed);
            } else if (typeof parsed?.delta === "string") {
              accumulatedText += parsed.delta;
              onChunk(parsed.delta);
            }
          } catch {
            const fallback = trimmed.slice(2);
            accumulatedText += fallback;
            onChunk(fallback);
          }
        } else if (
          !trimmed.startsWith("d:") &&
          !trimmed.startsWith("e:") &&
          !trimmed.startsWith("2:") &&
          !trimmed.startsWith("event:")
        ) {
          // 3. Raw JSON or plain text line
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed?.type === "text-delta" && typeof parsed.delta === "string") {
              accumulatedText += parsed.delta;
              onChunk(parsed.delta);
            } else if (typeof parsed?.delta === "string") {
              accumulatedText += parsed.delta;
              onChunk(parsed.delta);
            }
          } catch {
            // ignore non-text protocol lines
          }
        }
      }
    }

    onFinish?.(accumulatedText);
    return accumulatedText;
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    onError?.(errorObj);
    throw errorObj;
  }
}
