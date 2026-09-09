import { inngest } from "../inngest/client.js";

export async function enqueueConversationSummarize(input: {
  conversationId: string;
  userId: string;
}) {
  try {
    await inngest.send({
      name: "conversation/summarize",
      data: input,
    });
  } catch (error) {
    console.warn("Failed to send conversation/summarize event to Inngest:", error);
  }
}
