import { inngest } from "./client.js";
import SourceRepository from "../modules/source/source.repository.js";
import SourceChunkRepository from "../modules/source/source-chunk.repository.js";
import {
  chunkSourceContent,
  embedAndIndexSource,
  extractSourceContent,
  markSourceFailed,
  markSourceProcessing,
} from "../services/source-processing.services.js";
import { summarizeConversationById } from "../services/conversation-memory.services.js";

const sourceRepo = new SourceRepository();
const chunkRepo = new SourceChunkRepository();

export const processSource = inngest.createFunction(
  {
    id: "process-source",
    retries: 3,
    triggers: [{ event: "source/created" }],
  },
  async ({ event, step }) => {
    const { sourceId } = event.data;

    await step.run("mark-processing", () => markSourceProcessing(sourceId));

    try {
      const extracted = await step.run("extract-content", () =>
        extractSourceContent(sourceId),
      );

      await step.run("chunk-content", () =>
        chunkSourceContent(sourceId, extracted.text, extracted.pages),
      );

      const result = await step.run("embed-and-index", async () => {
        const source = await sourceRepo.findSourceById(sourceId);
        if (!source) {
          throw new Error("Source not found");
        }

        const chunks = await chunkRepo.findChunksBySourceId(sourceId);
        await embedAndIndexSource(source, chunks);

        return { chunkCount: chunks.length };
      });

      return { sourceId, status: "READY", ...result };
    } catch (error) {
      await step.run("mark-failed", async () => {
        const source = await sourceRepo.findSourceById(sourceId);
        if (source) {
          await markSourceFailed(sourceId, error, source.metadata);
        }
      });
      throw error;
    }
  },
);

export const summarizeConversation = inngest.createFunction(
  {
    id: "summarize-conversation",
    retries: 2,
    triggers: [{ event: "conversation/summarize" }],
  },
  async ({ event, step }) => {
    const { conversationId, userId } = event.data;

    await step.run("summarize", () =>
      summarizeConversationById(conversationId, userId),
    );

    return { conversationId, status: "SUMMARIZED" };
  },
);

export const functions = [processSource, summarizeConversation];

