import { inngest } from "../inngest/client.js";

export async function enqueueSourceProcessing(input: {
  sourceId: string;
  workspaceId: string;
}) {
  try {
    await inngest.send({
      name: "source/created",
      data: input,
    });
  } catch (error) {
    // If Inngest is not reachable locally or running in standalone mode, log warning
    console.warn("Failed to send source/created event to Inngest:", error);
  }
}
