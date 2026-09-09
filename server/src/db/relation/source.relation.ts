import { defineRelations } from "drizzle-orm";
import { workspace } from "../schema/workspace.js";
import { source, sourceChunk } from "../schema/source.js";

export const sourceRelations = defineRelations(
  {
    workspace,
    source,
    sourceChunk,
  },
  (r) => ({
    workspace: {
      sources: r.many.source(),
    },

    source: {
      workspace: r.one.workspace({
        from: r.source.workspaceId,
        to: r.workspace.id,
      }),

      chunks: r.many.sourceChunk(),
    },

    sourceChunk: {
      source: r.one.source({
        from: r.sourceChunk.sourceId,
        to: r.source.id,
      }),
    },
  }),
);
