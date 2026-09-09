import { Router } from "express";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { chatController } from "./chat.controller.js";

export const chatRoutes = Router({ mergeParams: true });

chatRoutes.use(requireAuth);

// Streaming chat endpoint: POST /api/workspaces/:workspaceId/chat
chatRoutes.post(
  "/",
  asyncHandler(chatController.chat.bind(chatController)),
);

// Conversation management
chatRoutes.get(
  "/conversations",
  asyncHandler(chatController.listConversations.bind(chatController)),
);

chatRoutes.post(
  "/conversations",
  asyncHandler(chatController.createConversation.bind(chatController)),
);

chatRoutes.get(
  "/conversations/:conversationId/messages",
  asyncHandler(chatController.getMessages.bind(chatController)),
);

chatRoutes.delete(
  "/conversations/:conversationId",
  asyncHandler(chatController.deleteConversation.bind(chatController)),
);
