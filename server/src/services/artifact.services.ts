import { enqueueArtifactGeneration } from "../lib/artifact-events.js";
import {
  artifactRepository,
  type ArtifactRecord,
} from "../modules/artifact/artifact.repository.js";
import WorkspaceRepository from "../modules/workspace/workspace.repository.js";
import { NotFoundError } from "../common/utils/app-error.js";
import {
  gatherSourceContext,
  generateArtifactContent,
} from "./artifact-generation.services.js";
import type { CreateArtifactInput } from "../modules/artifact/artifact.validation.js";

const workspaceRepo = new WorkspaceRepository();

async function assertWorkspaceAccess(workspaceId: string, userId: string) {
  const [ws] = await workspaceRepo.findWorkspaceByIdAndUserId(workspaceId, userId);
  if (!ws) {
    throw new NotFoundError("Workspace not found");
  }
  return ws;
}

export async function listArtifactsForWorkspace(
  workspaceId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);
  return artifactRepository.findArtifactsByWorkspaceId(workspaceId);
}

export async function getArtifactForWorkspace(
  workspaceId: string,
  artifactId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const artifact = await artifactRepository.findArtifactByIdAndWorkspaceId(
    artifactId,
    workspaceId,
  );

  if (!artifact) {
    throw new NotFoundError("Artifact not found");
  }

  return artifact;
}

export async function createArtifactForWorkspace(
  workspaceId: string,
  userId: string,
  input: CreateArtifactInput,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const context = await gatherSourceContext(
    workspaceId,
    input.sourceIds,
  );

  const defaultTitles: Record<string, string> = {
    SUMMARY: "Summary",
    TAKEAWAYS: "Key Takeaways",
    FLASHCARDS: "Flashcards",
    QUIZ: "Quiz",
    MINDMAP: "Mind Map",
    REPORT: "AI Report",
  };

  const artifact = await artifactRepository.createArtifactRecord({
    workspaceId,
    type: input.type,
    title:
      input.title ||
      `${defaultTitles[input.type] || "Artifact"} · ${new Date().toLocaleDateString()}`,
    sourceIds: context.sourceIds,
    status: "PENDING",
  });

  await enqueueArtifactGeneration({
    artifactId: artifact.id,
    workspaceId,
  });

  return artifact;
}

export async function deleteArtifactForWorkspace(
  workspaceId: string,
  artifactId: string,
  userId: string,
) {
  await getArtifactForWorkspace(workspaceId, artifactId, userId);
  await artifactRepository.deleteArtifactRecord(artifactId);
}

export async function processArtifactById(artifactId: string) {
  const artifact = await artifactRepository.findArtifactById(artifactId);
  if (!artifact) {
    throw new Error("Artifact not found");
  }

  await artifactRepository.updateArtifactRecord(artifactId, { status: "PROCESSING" });

  try {
    const context = await gatherSourceContext(
      artifact.workspaceId,
      artifact.sourceIds,
    );

    const content = await generateArtifactContent(
      artifact.type,
      context.text,
    );

    return artifactRepository.updateArtifactRecord(artifactId, {
      status: "READY",
      content,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingError: undefined,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Artifact generation failed";

    await artifactRepository.updateArtifactRecord(artifactId, {
      status: "FAILED",
      metadata: {
        processingError: message,
      },
    });

    throw error;
  }
}

export type { ArtifactRecord };
