import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { db } from "../../db/index.js";
import { session as sessionTable, user as userTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
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
      const lastDot = raw.lastIndexOf(".");
      return lastDot > 0 ? raw.slice(0, lastDot) : raw;
    }
  }
  return null;
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
    const token = extractTokenFromRequest(req);
    if (token) {
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
