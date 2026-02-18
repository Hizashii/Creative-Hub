import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ProjectModel } from "../models/projects.models";
import { MemberModel } from "../models/project_memebers.models";

export async function requireProjectAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(401, "Not authenticated"));

  const projectId = req.params.projectId || req.params.id;
  if (!projectId) return next(new ApiError(400, "Missing project id in route params"));

  const project = await ProjectModel.findById(projectId).select("owner_id");
  if (!project) return next(new ApiError(404, "Project not found"));

  // Admin can access everything
  if (req.user.role === "admin") return next();

  const userId = req.user.id;
  const isOwner = project.owner_id === userId;
  const member = await MemberModel.findOne({ project_id: projectId, user_id: userId });
  const isMember = !!member;

  if (!isOwner && !isMember) return next(new ApiError(403, "No access to this project"));

  next();
}
