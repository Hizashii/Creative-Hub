import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.models";
import type { AppUserRole } from "../types/roles";
import { registerBody } from "../schemas/validation";

type RegisterInput = z.infer<typeof registerBody>;

function userPublic(u: { _id: unknown; email: string; name: string; role: AppUserRole }) {
  return { id: String(u._id), email: u.email, name: u.name, role: u.role };
}

function signToken(user: { _id: unknown; role: AppUserRole }) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new ApiError(500, "JWT_ACCESS_SECRET not set");
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn: "7d" });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body as RegisterInput;

  const exists = await UserModel.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: role ?? "client",
  });

  const token = signToken(user);
  res.status(201).json({ token, user: userPublic(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  const token = signToken(user);
  res.json({ token, user: userPublic(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await UserModel.findById(req.user.id).lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json(userPublic(user as { _id: unknown; email: string; name: string; role: AppUserRole }));
});
