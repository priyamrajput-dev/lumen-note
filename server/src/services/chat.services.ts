import { openai } from "@ai-sdk/openai";
import type { Response } from "express";
import { z } from "zod";
import {
  convertToModelMessages,
  createUIMessageStream,
  isStepCount,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import {
  CHAT_MODEL,
  CHAT_MODELS,
  CONVERSATION_SUMMARY_INTERVAL,
  RECENT_MESSAGE_WINDOW,
} from "../lib/ai-config.js";
import { enqueueConversationSummarize } from "../lib/conversation-events.js";
import {
  buildChatSystemPrompt,
  retrieveWorkspaceContext,
} from "../lib/rag/retrieve.js";
import { conversationRepository } from "../modules/conversation/conversation.repository.js";
import { messageRepository } from "../modules/conversation/message.repository.js";
import WorkspaceRepository from "../modules/workspace/workspace.repository.js";
import {
  formatTavilyResultsForPrompt,
  searchWeb,
  type TavilySearchResponse,
} from "../lib/tavily.js";
import { NotFoundError, ValidationError } from "../common/utils/app-error.js";
import {
  buildConversationTitle,
  getLastUserMessageText,
  getTextFromUIMessage,
} from "../utils/chat-message.js";
import { addMemoriesFromMessages, searchUserMemories } from "../lib/mem0.js";
import { env } from "../common/config/env.js";

const workspaceRepo = new WorkspaceRepository();

async function assertWorkspaceAccess(workspaceId: string, userId: string) {
  const [ws] = await workspaceRepo.findWorkspaceByIdAndUserId(workspaceId, userId);
  if (!ws) {
    throw new NotFoundError("Workspace not found");
  }
  return ws;
}

export async function listConversationsForWorkspace(
  workspaceId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);
  return conversationRepository.findConversationsByWorkspaceId(workspaceId);
}

export async function createConversationForWorkspace(
  workspaceId: string,
  userId: string,
  title?: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);
  return conversationRepository.createConversationRecord(workspaceId, title);
}

export async function getConversationMessagesForWorkspace(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const conversation = await conversationRepository.findConversationByIdAndWorkspaceId(
    conversationId,
    workspaceId,
  );

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  return messageRepository.findMessagesByConversationId(conversationId);
}

export async function deleteConversationForWorkspace(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const conversation = await conversationRepository.findConversationByIdAndWorkspaceId(
    conversationId,
    workspaceId,
  );

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  await conversationRepository.deleteConversationRecord(conversationId);
}

async function resolveConversation(
  workspaceId: string,
  conversationId: string | undefined,
  firstMessage: string,
) {
  if (conversationId) {
    const existing = await conversationRepository.findConversationByIdAndWorkspaceId(
      conversationId,
      workspaceId,
    );

    if (!existing) {
      throw new NotFoundError("Conversation not found");
    }

    return existing;
  }

  return conversationRepository.createConversationRecord(
    workspaceId,
    buildConversationTitle(firstMessage),
  );
}

export async function streamWorkspaceChat(
  res: Response,
  workspaceId: string,
  userId: string,
  input: {
    conversationId?: string;
    messages: UIMessage[];
    model?: string;
    webSearch?: boolean;
  },
) {
  const workspace = await assertWorkspaceAccess(workspaceId, userId);
  const requestedModel = input.model ?? workspace.defaultModel ?? CHAT_MODEL;
  const chatModel =
    (CHAT_MODELS as readonly string[]).find((model) => model === requestedModel) ?? CHAT_MODEL;
  const webSearchEnabled =
    input.webSearch === true && !!env.TAVILY_API_KEY?.trim();

  const userText = getLastUserMessageText(input.messages);
  if (!userText) {
    throw new ValidationError("A user message is required");
  }

  const conversation = await resolveConversation(
    workspaceId,
    input.conversationId,
    userText,
  );

  await messageRepository.createMessageRecord({
    conversationId: conversation.id,
    role: "USER",
    content: userText,
  });

  const [retrievedChunks, userMemories] = await Promise.all([
    retrieveWorkspaceContext(workspaceId, userText),
    searchUserMemories(userId, userText),
  ]);

  const citations = retrievedChunks.map((chunk) => ({
    sourceId: chunk.sourceId,
    sourceTitle: chunk.sourceTitle,
    sourceType: chunk.sourceType,
    chunkId: chunk.chunkId,
    chunkIndex: chunk.chunkIndex,
    page: chunk.page,
    excerpt: chunk.text.slice(0, 280),
    score: chunk.score,
  }));

  const systemPrompt = buildChatSystemPrompt({
    chunks: retrievedChunks,
    conversationSummary: conversation.summary,
    userMemories: userMemories.map((memory) => memory.memory),
    webSearchEnabled,
  });

  const contextMessages =
    conversation.summary && input.messages.length > RECENT_MESSAGE_WINDOW
      ? input.messages.slice(-RECENT_MESSAGE_WINDOW)
      : input.messages;

  let webSearchResults: TavilySearchResponse | null = null;

  const stream = createUIMessageStream({
    originalMessages: input.messages,
    execute: async ({ writer }) => {
      const tools = webSearchEnabled
        ? {
            web_search: tool({
              description:
                "Search the web for up-to-date information outside the workspace sources.",
              inputSchema: z.object({
                query: z
                  .string()
                  .describe("The search query for current web information"),
              }),
              execute: async ({ query }) => {
                const results = await searchWeb(query);
                webSearchResults = results;
                return formatTavilyResultsForPrompt(results);
              },
            }),
          }
        : undefined;

      const result = streamText({
        model: openai(chatModel),
        system: systemPrompt,
        messages: await convertToModelMessages(contextMessages),
        tools,
        stopWhen: webSearchEnabled ? isStepCount(3) : undefined,
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted) {
        return;
      }

      const assistantText = getTextFromUIMessage(responseMessage).trim();
      if (!assistantText) {
        return;
      }

      const webCitations = webSearchResults
        ? webSearchResults.results.map((result) => ({
            sourceType: "WEB" as const,
            sourceTitle: result.title,
            url: result.url,
            excerpt: result.content.slice(0, 280),
          }))
        : [];
      const allCitations = [...citations, ...webCitations];

      await messageRepository.createMessageRecord({
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: assistantText,
        citations: allCitations,
      });

      await conversationRepository.touchConversation(conversation.id);

      if (!conversation.title) {
        await conversationRepository.updateConversationRecord(conversation.id, {
          title: buildConversationTitle(userText),
        });
      }

      const messageCount = await messageRepository.countMessagesByConversationId(
        conversation.id,
      );

      if (messageCount % CONVERSATION_SUMMARY_INTERVAL === 0) {
        await enqueueConversationSummarize({
          conversationId: conversation.id,
          userId,
        });
      }

      void addMemoriesFromMessages(
        userId,
        [
          { role: "user", content: userText },
          { role: "assistant", content: assistantText },
        ],
        {
          source: "learned",
          conversationId: conversation.id,
        },
      ).catch((error) => {
        console.error("Mem0 add failed:", error);
      });
    },
  });

  await pipeUIMessageStreamToResponse({
    response: res,
    stream,
    headers: {
      "X-Conversation-Id": conversation.id,
    },
  });
}
