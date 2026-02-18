import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function requireRole(...allowed: Array<"admin" | "member" | "viewer">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!allowed.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    next();
  };
}
