import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "../common/config/env.js";

const clientURL = env.CLIENT_URL;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    clientURL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean),
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
    },
  },
});
