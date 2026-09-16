import { Inngest } from "inngest";
import { env } from "../common/config/env.js";

export const inngest = new Inngest({
  id: "lumen-note",
  isDev: process.env.NODE_ENV !== "production" || !env.INNGEST_SIGNING_KEY,
});

export type SourceCreatedEvent = {
  name: "source/created";
  data: {
    sourceId: string;
    workspaceId: string;
  };
};

export type ArtifactGenerateEvent = {
  name: "artifact/generate";
  data: {
    artifactId: string;
  };
};

export type ConversationSummarizeEvent = {
  name: "conversation/summarize";
  data: {
    conversationId: string;
    userId: string;
  };
};

export type InngestEvents = {
  "source/created": SourceCreatedEvent;
  "artifact/generate": ArtifactGenerateEvent;
  "conversation/summarize": ConversationSummarizeEvent;
};
