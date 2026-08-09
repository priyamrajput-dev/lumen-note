import { defineRelations } from "drizzle-orm";
import { workspace } from "../schema/workspace.js";
import { user } from "../schema.js";

export const workspaceRelation = defineRelations(
  {
    workspace,
    user,
  },
  (r) => ({
    workspace: {
      user: r.one.user({
        from: r.workspace.userId,
        to: r.user.id,
      }),
    },
  }),
);
