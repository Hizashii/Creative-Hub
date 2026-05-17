import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import type { AppUserRole } from "../types/roles";
import { skipAuthBypass } from "../utils/skipAuthBypass";
import { UserModel } from "../models/user.models";

type JwtPayload = {
  sub: string;
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (skipAuthBypass()) {
    const id = process.env.DEV_USER_ID;
    if (!id) {
      return next(new ApiError(500, "SKIP_AUTH is true but DEV_USER_ID is not set"));
    }
    req.user = { id, role: (process.env.DEV_USER_ROLE as AppUserRole) || "admin" };
    return next();
  }

  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return next(new ApiError(500, "JWT_ACCESS_SECRET not set"));

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }

  try {
    const user = await UserModel.findById(decoded.sub).select("role").lean();
    if (!user) return next(new ApiError(401, "User no longer exists"));
    req.user = {
      id: decoded.sub,
      role: (user as { role: AppUserRole }).role,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}
