import { defineRelations } from "drizzle-orm";
import { account, session, user, verification, workspace } from "../schema.js";

export const authRelations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    workspace,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      workspaces: r.many.workspace(), // User -> Workspace
    },

    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },

    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
  }),
);
