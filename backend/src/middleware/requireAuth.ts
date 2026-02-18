import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

type JwtPayload = {
  sub: string; // user id
  role: "admin" | "member" | "viewer";
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new ApiError(500, "JWT_ACCESS_SECRET not set");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
