import { defineRelations } from "drizzle-orm";
import { workspace } from "../schema/workspace.js";
import { conversation, message } from "../schema/conversation.js";

export const conversationRelations = defineRelations(
  {
    workspace,
    conversation,
    message,
  },
  (r) => ({
    workspace: {
      conversations: r.many.conversation(),
    },
    conversation: {
      workspace: r.one.workspace({
        from: r.conversation.workspaceId,
        to: r.workspace.id,
      }),
      messages: r.many.message(),
    },
    message: {
      conversation: r.one.conversation({
        from: r.message.conversationId,
        to: r.conversation.id,
      }),
    },
  }),
);
