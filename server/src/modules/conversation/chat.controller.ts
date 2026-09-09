import type { Request, Response } from "express";
import {
  chatBodySchema,
  conversationIdParamSchema,
  createConversationSchema,
} from "./chat.validation.js";
import { workspaceIdParamSchema } from "../workspace/workspace.validation.js";
import { ValidationError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import AppResponse from "../../common/utils/app-response.js";
import {
  createConversationForWorkspace,
  deleteConversationForWorkspace,
  getConversationMessagesForWorkspace,
  listConversationsForWorkspace,
  streamWorkspaceChat,
} from "../../services/chat.services.js";

class ChatController {
  private parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid workspace id", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseConversationParams(params: Request["params"]) {
    const parsed = conversationIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid conversation parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseCreateConversationBody(body: unknown) {
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseChatBody(body: unknown) {
    const parsed = chatBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid chat payload", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  async listConversations(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const conversations = await listConversationsForWorkspace(
      workspaceId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Conversations retrieved successfully", conversations);
  }

  async createConversation(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const input = this.parseCreateConversationBody(req.body);
    const conversation = await createConversationForWorkspace(
      workspaceId,
      req.session.user.id,
      input.title,
    );
    AppResponse.created(res, "Conversation created successfully", conversation);
  }

  async getMessages(req: Request, res: Response) {
    const { workspaceId, conversationId } = this.parseConversationParams(req.params);
    const messages = await getConversationMessagesForWorkspace(
      workspaceId,
      conversationId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Messages retrieved successfully", messages);
  }

  async deleteConversation(req: Request, res: Response) {
    const { workspaceId, conversationId } = this.parseConversationParams(req.params);
    await deleteConversationForWorkspace(
      workspaceId,
      conversationId,
      req.session.user.id,
    );
    AppResponse.ok(res, "Conversation deleted successfully");
  }

  async chat(req: Request, res: Response) {
    const { workspaceId } = this.parseWorkspaceId(req.params);
    const input = this.parseChatBody(req.body);

    await streamWorkspaceChat(
      res,
      workspaceId,
      req.session.user.id,
      input as unknown as Parameters<typeof streamWorkspaceChat>[3],
    );
  }
}

export const chatController = new ChatController();
export default ChatController;
