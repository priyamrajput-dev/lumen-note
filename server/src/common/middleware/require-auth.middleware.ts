import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { db } from "../../db/index.js";
import { session as sessionTable, user as userTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

function extractTokensFromRequest(req: Request): string[] {
  const tokens: string[] = [];
  const authHeader = req.headers.authorization;
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    let token = authHeader.slice(7).trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    if (token) {
      tokens.push(token);
      const lastDot = token.lastIndexOf(".");
      if (lastDot > 0) {
        tokens.push(token.slice(0, lastDot));
      }
    }
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(
      /(?:__Secure-better-auth\.session_token|better-auth\.session_token|session_token)=([^;]+)/,
    );
    if (match) {
      let raw = decodeURIComponent(match[1].trim());
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = raw.slice(1, -1);
      }
      tokens.push(raw);
      const lastDot = raw.lastIndexOf(".");
      if (lastDot > 0) {
        tokens.push(raw.slice(0, lastDot));
      }
    }
  }
  return [...new Set(tokens.filter(Boolean))];
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  let session: any = null;

  try {
    session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch (err) {
    // fallback to manual token lookup
  }

  // Fallback if Better Auth helper did not parse the session but token is in cookie or header
  if (!session?.user) {
    const tokens = extractTokensFromRequest(req);
    for (const token of tokens) {
      const [foundSession] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, token));

      if (foundSession && new Date(foundSession.expiresAt) > new Date()) {
        const [foundUser] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, foundSession.userId));

        if (foundUser) {
          session = {
            session: foundSession,
            user: foundUser,
          };
          break;
        }
      }
    }
  }

  if (!session?.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.session = session;
  next();
}
