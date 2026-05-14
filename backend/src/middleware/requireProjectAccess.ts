import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { ProjectModel } from "../models/projects.models";
import { MemberModel } from "../models/project_memebers.models";
import { parseObjectId } from "../utils/mongoose";
import { readRouteString } from "../utils/routeParams";

export async function requireProjectAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(401, "Not authenticated"));

  let idStr: string;
  try {
    idStr = readRouteString(req, "projectId");
  } catch {
    try {
      idStr = readRouteString(req, "id");
    } catch {
      return next(new ApiError(400, "Missing project id in route params"));
    }
  }

  let projectId: Types.ObjectId;
  try {
    projectId = parseObjectId(idStr, "project id");
  } catch (e) {
    return next(e);
  }

  const project = await ProjectModel.findById(projectId).select("ownerId").lean();
  if (!project) return next(new ApiError(404, "Project not found"));

  if (req.user.role === "admin") return next();

  const userId = new Types.ObjectId(req.user.id);
  const isOwner = project.ownerId?.equals(userId);
  const member = await MemberModel.findOne({ projectId, userId }).lean();

  if (!isOwner && !member) return next(new ApiError(403, "No access to this project"));

  next();
}
