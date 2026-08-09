import type { Session } from "../lib/session";

declare global {
  namespace Express {
    interface Request {
      session: Session;
    }
  }
}

export {};