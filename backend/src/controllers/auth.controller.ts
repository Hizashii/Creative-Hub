import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.models";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) throw new ApiError(400, "Email, password and name required");

  const existing = await UserModel.findOne({ email });
  if (existing) throw new ApiError(400, "Email already registered");

  const user = await UserModel.create({
    id: crypto.randomUUID(),
    email,
    password,
    name,
    role: "member",
  });

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new ApiError(500, "JWT_ACCESS_SECRET not set");

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password required");

  const user = await UserModel.findOne({ email }).lean();
  if (!user || user.password !== password) throw new ApiError(401, "Invalid credentials");

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new ApiError(500, "JWT_ACCESS_SECRET not set");

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await UserModel.findOne({ id: req.user.id }).select("-password").lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json(user);
});
