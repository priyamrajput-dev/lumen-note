import { enqueueArtifactGeneration } from "../../lib/artifact-events.js";
import {
  artifactRepository,
  type ArtifactRecord,
} from "./artifact.repository.js";
import WorkspaceRepository from "../workspace/workspace.repository.js";
import { NotFoundError } from "../../common/utils/app-error.js";
import {
  gatherSourceContext,
  generateArtifactContent,
} from "./artifact-generation.service.js";
import type { CreateArtifactInput } from "./artifact.validation.js";
import {
  buildCacheKey,
  getOrSetCache,
  delCache,
} from "../../lib/cache.js";

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
  const key = buildCacheKey("artifacts", workspaceId);
  return getOrSetCache(key, 180, () =>
    artifactRepository.findArtifactsByWorkspaceId(workspaceId),
  );
}

export async function getArtifactForWorkspace(
  workspaceId: string,
  artifactId: string,
  userId: string,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const key = buildCacheKey("artifact", artifactId);
  return getOrSetCache(key, 300, async () => {
    const artifact = await artifactRepository.findArtifactByIdAndWorkspaceId(
      artifactId,
      workspaceId,
    );

    if (!artifact) {
      throw new NotFoundError("Artifact not found");
    }

    return artifact;
  });
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

  await delCache(buildCacheKey("artifacts", workspaceId));

  return artifact;
}

export async function deleteArtifactForWorkspace(
  workspaceId: string,
  artifactId: string,
  userId: string,
) {
  await getArtifactForWorkspace(workspaceId, artifactId, userId);
  await artifactRepository.deleteArtifactRecord(artifactId);
  await delCache(
    buildCacheKey("artifact", artifactId),
    buildCacheKey("artifacts", workspaceId),
  );
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

    const updated = await artifactRepository.updateArtifactRecord(artifactId, {
      status: "READY",
      content,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingError: undefined,
      },
    });

    await delCache(
      buildCacheKey("artifact", artifactId),
      buildCacheKey("artifacts", artifact.workspaceId),
    );

    return updated;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Artifact generation failed";

    await artifactRepository.updateArtifactRecord(artifactId, {
      status: "FAILED",
      metadata: {
        processingError: message,
      },
    });

    await delCache(
      buildCacheKey("artifact", artifactId),
      buildCacheKey("artifacts", artifact.workspaceId),
    );

    throw error;
  }
}

export type { ArtifactRecord };
