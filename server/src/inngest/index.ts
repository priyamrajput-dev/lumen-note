import { inngest } from "./client.js";
import SourceRepository from "../modules/source/source.repository.js";
import SourceChunkRepository from "../modules/source/source-chunk.repository.js";
import {
  chunkSourceContent,
  embedAndIndexSource,
  extractSourceContent,
  markSourceFailed,
  markSourceProcessing,
} from "../modules/source/source-processing.service.js";
import { summarizeConversationById } from "../modules/conversation/conversation-memory.service.js";
import { processArtifactById } from "../modules/artifact/artifact.service.js";

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

export const generateArtifact = inngest.createFunction(
  {
    id: "generate-artifact",
    retries: 2,
    triggers: [{ event: "artifact/generate" }],
  },
  async ({ event, step }) => {
    const { artifactId } = event.data;

    await step.run("generate", () => processArtifactById(artifactId));

    return { artifactId, status: "READY" };
  },
);

export const keepAliveCron = inngest.createFunction(
  {
    id: "keep-alive-cron",
    retries: 1,
    triggers: [{ cron: "*/10 * * * *" }],
  },
  async ({ step }) => {
    return await step.run("ping-health-and-frontend", async () => {
      const backendUrl = (
        process.env.RENDER_EXTERNAL_URL ||
        process.env.BETTER_AUTH_URL ||
        "https://lumennote.onrender.com"
      ).replace(/\/+$/, "");

      const frontendUrl = (
        process.env.CLIENT_URL ||
        "https://lumen-note-priyamrajput00s-projects.vercel.app"
      ).replace(/\/+$/, "");

      const [backendRes, frontendRes] = await Promise.allSettled([
        fetch(`${backendUrl}/api/health`, {
          headers: { "User-Agent": "LumenNote-InngestKeepAlive/1.0" },
        }),
        fetch(frontendUrl, {
          headers: { "User-Agent": "LumenNote-InngestKeepAlive/1.0" },
        }),
      ]);

      return {
        timestamp: new Date().toISOString(),
        backendStatus:
          backendRes.status === "fulfilled" ? backendRes.value.status : "failed",
        frontendStatus:
          frontendRes.status === "fulfilled" ? frontendRes.value.status : "failed",
      };
    });
  },
);

export const functions = [
  processSource,
  summarizeConversation,
  generateArtifact,
  keepAliveCron,
];



