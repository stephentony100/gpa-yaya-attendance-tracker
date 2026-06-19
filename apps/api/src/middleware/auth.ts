import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";
import { HttpError } from "../lib/errors";

interface AdminJwtPayload {
  sub: string;
  name: string;
  email: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;

  if (!token) {
    throw new HttpError(401, "Authentication required.");
  }

  try {
    // TODO(post-launch): implement token blacklist/refresh mechanism
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
    req.admin = { id: payload.sub, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new HttpError(403, "Token has expired.");
    }
    throw new HttpError(401, "Invalid token.");
  }
}
