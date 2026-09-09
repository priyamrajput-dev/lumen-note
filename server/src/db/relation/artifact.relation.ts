import { defineRelations } from "drizzle-orm";
import { workspace } from "../schema/workspace.js";
import { learningArtifact } from "../schema/artifact.js";

export const artifactRelations = defineRelations(
  {
    workspace,
    learningArtifact,
  },
  (r) => ({
    workspace: {
      artifacts: r.many.learningArtifact(),
    },
    learningArtifact: {
      workspace: r.one.workspace({
        from: r.learningArtifact.workspaceId,
        to: r.workspace.id,
      }),
    },
  }),
);
