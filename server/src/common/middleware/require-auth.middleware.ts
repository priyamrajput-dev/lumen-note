import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { db } from "../../db/index.js";
import { session as sessionTable, user as userTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

function extractTokenFromRequest(req: Request): string | null {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:better-auth\.session_token|__Secure-better-auth\.session_token|session_token)=([^;]+)/);
    if (match) {
      const raw = decodeURIComponent(match[1].trim());
      return raw.split(".")[0];
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
