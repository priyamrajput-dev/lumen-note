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

export async function getConversations(
  workspaceId: string,
): Promise<Conversation[]> {
  const res = await apiClient.get<ApiResponse<Conversation[]>>(
    `/workspaces/${workspaceId}/chat/conversations`,
  );
  return res.data.data;
}

export async function createConversation(
  workspaceId: string,
  title?: string,
): Promise<Conversation> {
  const res = await apiClient.post<ApiResponse<Conversation>>(
    `/workspaces/${workspaceId}/chat/conversations`,
    { title },
  );
  return res.data.data;
}

export async function getMessages(
  workspaceId: string,
  conversationId: string,
): Promise<Message[]> {
  const res = await apiClient.get<ApiResponse<Message[]>>(
    `/workspaces/${workspaceId}/chat/conversations/${conversationId}/messages`,
  );
  return res.data.data;
}

export async function deleteConversation(
  workspaceId: string,
  conversationId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/workspaces/${workspaceId}/chat/conversations/${conversationId}`,
  );
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
  try {
    const formattedMessages = messages.map((m, idx) => ({
      id: `msg-${idx}-${Date.now()}`,
      role: m.role,
      content: m.content,
      parts: [{ type: "text", text: m.content }],
    }));

    const response = await fetch(`/api/workspaces/${workspaceId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        conversationId: conversationId || undefined,
        messages: formattedMessages,
        model,
        webSearch: !!webSearch,
      }),
      signal,
    });

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
        if (!line.trim()) continue;

        // Vercel AI SDK UI message stream format parsing:
        // Text delta lines typically begin with `0:"..."` or `text-delta:0:"..."`
        if (line.startsWith("0:")) {
          try {
            const rawContent = line.slice(2);
            const parsed = JSON.parse(rawContent);
            if (typeof parsed === "string") {
              accumulatedText += parsed;
              onChunk(parsed);
            }
          } catch {
            // fallback if not JSON encoded
            const fallback = line.slice(2);
            accumulatedText += fallback;
            onChunk(fallback);
          }
        } else if (line.startsWith("data: ")) {
          // SSE fallback
          const sseData = line.slice(6).trim();
          if (sseData === "[DONE]") continue;
          try {
            const parsed = JSON.parse(sseData);
            if (typeof parsed === "string") {
              accumulatedText += parsed;
              onChunk(parsed);
            } else if (parsed?.text) {
              accumulatedText += parsed.text;
              onChunk(parsed.text);
            }
          } catch {
            accumulatedText += sseData;
            onChunk(sseData);
          }
        } else if (!line.startsWith("d:") && !line.startsWith("e:") && !line.startsWith("2:")) {
          // Raw stream chunk
          accumulatedText += line;
          onChunk(line);
        }
      }
    }

    // Process any remaining text in buffer
    if (buffer.trim()) {
      if (buffer.startsWith("0:")) {
        try {
          const parsed = JSON.parse(buffer.slice(2));
          if (typeof parsed === "string") {
            accumulatedText += parsed;
            onChunk(parsed);
          }
        } catch {
          accumulatedText += buffer.slice(2);
          onChunk(buffer.slice(2));
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
