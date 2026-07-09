import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

const SESSION_COOKIE = "sessionId";

declare module "express-serve-static-core" {
  interface Request {
    sessionId: string;
  }
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  let sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax" });
  }
  req.sessionId = sessionId;
  next();
}
