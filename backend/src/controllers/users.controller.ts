import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.models";
import { parseRequestObjectId } from "../utils/routeParams";
import type { AppUserRole } from "../types/roles";

function userPublic(u: { _id: unknown; email: string; name: string; role: AppUserRole }) {
  return { id: String(u._id), email: u.email, name: u.name, role: u.role };
}

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserModel.find().sort({ name: 1 }).lean();
  res.json(
    users.map((u: { _id: unknown; email: string; name: string; role: AppUserRole }) => userPublic(u))
  );
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const id = parseRequestObjectId(req, "id", "user id");
  const { role } = req.body as { role: AppUserRole };

  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.id === id.toString()) throw new ApiError(400, "Cannot change your own role here");

  const user = await UserModel.findByIdAndUpdate(id, { $set: { role } }, { new: true }).lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json(userPublic(user as Parameters<typeof userPublic>[0]));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "id", "user id");
  if (req.user.id === id.toString()) throw new ApiError(400, "Cannot delete yourself");

  const u = await UserModel.findByIdAndDelete(id);
  if (!u) throw new ApiError(404, "User not found");
  res.status(204).send();
});
