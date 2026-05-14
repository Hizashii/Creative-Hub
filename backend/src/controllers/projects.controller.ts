import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ProjectModel } from "../models/projects.models";
import { MemberModel } from "../models/project_memebers.models";
import { ColumnModel } from "../models/columns.models";
import { TaskModel } from "../models/tasks.models";
import { AssetModel } from "../models/assets.models";
import { FeedbackModel } from "../models/feedback.models";
import { parseRequestObjectId } from "../utils/routeParams";
import { parseObjectId } from "../utils/mongoose";

async function projectIdsForUser(userId: Types.ObjectId, role: string) {
  if (role === "admin") {
    return (await ProjectModel.find().distinct("_id")) as Types.ObjectId[];
  }
  const owned = await ProjectModel.find({ ownerId: userId }).distinct("_id");
  const memberOf = await MemberModel.find({ userId }).distinct("projectId");
  const set = new Set([...owned.map(String), ...memberOf.map(String)]);
  return [...set].map((id) => new Types.ObjectId(id));
}

function projectJSON(p: {
  _id: unknown;
  title: string;
  description?: string;
  status: string;
  ownerId: unknown;
  briefId?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(p._id),
    title: p.title,
    description: p.description ?? "",
    status: p.status,
    ownerId: String(p.ownerId),
    briefId: p.briefId ? String(p.briefId) : undefined,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  const ids = await projectIdsForUser(userId, req.user.role);
  const items = await ProjectModel.find({ _id: { $in: ids } })
    .sort({ updatedAt: -1 })
    .lean();
  res.json(items.map(projectJSON));
});

export const adminListProjects = asyncHandler(async (_req: Request, res: Response) => {
  const items = await ProjectModel.find().sort({ updatedAt: -1 }).lean();
  res.json(items.map(projectJSON));
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { title, description, status } = req.body as {
    title: string;
    description?: string;
    status?: "draft" | "in_progress" | "paused" | "completed";
  };

  const ownerId = parseObjectId(req.user.id, "user id");
  const project = await ProjectModel.create({
    title,
    description: description ?? "",
    status: status ?? "in_progress",
    ownerId,
  });

  await MemberModel.create({
    projectId: project._id,
    userId: ownerId,
    memberRole: "lead",
  });

  const defaultColumns = ["Backlog", "In progress", "Review", "Done"];
  for (let i = 0; i < defaultColumns.length; i++) {
    await ColumnModel.create({
      projectId: project._id,
      title: defaultColumns[i],
      order: i,
    });
  }

  res.status(201).json(projectJSON(project.toObject()));
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "projectId", "project id");
  const p = await ProjectModel.findById(id).lean();
  if (!p) throw new ApiError(404, "Project not found");
  res.json(projectJSON(p as Parameters<typeof projectJSON>[0]));
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "projectId", "project id");
  const existing = await ProjectModel.findById(id).lean();
  if (!existing) throw new ApiError(404, "Project not found");

  const userId = parseObjectId(req.user.id, "user id");
  const isOwner = existing.ownerId?.equals(userId);
  if (req.user.role !== "admin" && !isOwner) throw new ApiError(403, "Forbidden");

  const { title, description, status } = req.body as {
    title?: string;
    description?: string;
    status?: "draft" | "in_progress" | "paused" | "completed";
  };

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;

  const p = await ProjectModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!p) throw new ApiError(404, "Project not found");
  res.json(projectJSON(p as Parameters<typeof projectJSON>[0]));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "projectId", "project id");
  const p = await ProjectModel.findById(id).lean();
  if (!p) throw new ApiError(404, "Project not found");

  const userId = parseObjectId(req.user.id, "user id");
  const isOwner = p.ownerId?.equals(userId);
  if (req.user.role !== "admin" && !isOwner) throw new ApiError(403, "Forbidden");

  await TaskModel.deleteMany({ projectId: id });
  await AssetModel.deleteMany({ projectId: id });
  await FeedbackModel.deleteMany({ projectId: id });
  await ColumnModel.deleteMany({ projectId: id });
  await MemberModel.deleteMany({ projectId: id });
  await ProjectModel.deleteOne({ _id: id });
  res.status(204).send();
});
