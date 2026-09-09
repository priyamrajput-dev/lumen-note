import { inngest } from "../inngest/client.js";

export async function enqueueArtifactGeneration(input: {
  artifactId: string;
  workspaceId: string;
}) {
  try {
    await inngest.send({
      name: "artifact/generate",
      data: input,
    });
  } catch (error) {
    console.warn("Failed to send artifact/generate event to Inngest:", error);
  }
}
