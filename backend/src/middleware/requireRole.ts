import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import type { AppUserRole } from "../types/roles";

export function requireRole(...allowed: AppUserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!allowed.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    next();
  };
}
