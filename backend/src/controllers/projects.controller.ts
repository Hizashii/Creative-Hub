import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ProjectModel } from "../models/projects.models";
import { BriefModel } from "../models/brief.models";
import { MemberModel } from "../models/project_memebers.models";
import { ColumnModel } from "../models/columns.models";
import { TaskModel } from "../models/tasks.models";
import { AssetModel } from "../models/assets.models";
import { FeedbackModel } from "../models/feedback.models";
import { parseRequestObjectId } from "../utils/routeParams";
import { parseObjectId } from "../utils/mongoose";
import { getAccessibleProjectIds } from "../services/accessibleProjects";
import { recordProjectPayment } from "../services/projectPayment";

type ProjectStatusInput = "draft" | "in_progress" | "pending" | "paused" | "completed";

function projectJSON(p: {
  _id: unknown;
  title: string;
  description?: string;
  status: string;
  ownerId: unknown;
  briefId?: unknown;
  price?: number | null;
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
    price: p.price ?? undefined,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

async function updateLinkedBriefStatus(briefId: unknown, status: "in-progress" | "pending" | "completed") {
  if (!briefId) return;
  await BriefModel.updateOne({ _id: briefId }, { $set: { status } });
}

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");

  // Designers: lazily ensure every submitted brief has a discoverable draft project.
  // Wrapped in try/catch so a bad document never blocks the whole response.
  if (req.user.role === "designer") {
    try {
      const submittedBriefs = await BriefModel.find({ status: "submitted" }).lean();
      if (submittedBriefs.length > 0) {
        const linked = await ProjectModel.find({
          briefId: { $in: submittedBriefs.map((b) => b._id) },
        }).select("briefId").lean();
        const linkedBriefIds = new Set(linked.map((p) => String(p.briefId)));

        for (const brief of submittedBriefs) {
          if (linkedBriefIds.has(String(brief._id))) continue;
          try {
            const project = await ProjectModel.create({
              title: brief.title,
              description: brief.description ?? "",
              status: "draft",
              ownerId: brief.clientId,
              briefId: brief._id,
            });
            await MemberModel.create({ projectId: project._id, userId: brief.clientId, memberRole: "lead" });
            const cols = ["Backlog", "In progress", "Review", "Done"];
            for (let i = 0; i < cols.length; i++) {
              await ColumnModel.create({ projectId: project._id, title: cols[i], order: i });
            }
            console.log(`[listProjects] Created draft project for brief ${String(brief._id)}: "${brief.title}"`);
          } catch (e) {
            console.error(`[listProjects] Could not create draft project for brief ${String(brief._id)}:`, e);
          }
        }
      }
    } catch (e) {
      console.error("[listProjects] Migration check failed:", e);
    }
  }

  const ids = await getAccessibleProjectIds(userId, req.user.role);
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
    status?: ProjectStatusInput;
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
  const isMember = await MemberModel.exists({ projectId: id, userId });
  const isDesignerMember = req.user.role === "designer" && Boolean(isMember);

  if (req.user.role !== "admin" && !isOwner && !isDesignerMember) {
    throw new ApiError(403, "Forbidden");
  }

  const { title, description, status, price } = req.body as {
    title?: string;
    description?: string;
    status?: ProjectStatusInput;
    price?: number;
  };

  const updates: Record<string, unknown> = {};
  if (title !== undefined && (isOwner || req.user.role === "admin")) updates.title = title;
  if (description !== undefined && (isOwner || req.user.role === "admin")) updates.description = description;
  if (status !== undefined && (isOwner || req.user.role === "admin" || isDesignerMember)) updates.status = status;
  if (price !== undefined && (req.user.role === "designer" || req.user.role === "admin")) {
    updates.price = price;
  }

  const p = await ProjectModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!p) throw new ApiError(404, "Project not found");
  if (status === "pending" || status === "completed" || status === "in_progress") {
    await updateLinkedBriefStatus(p.briefId, status === "in_progress" ? "in-progress" : status);
  }
  if (status === "completed") {
    await recordProjectPayment(p as { _id: unknown; ownerId: unknown; price?: number | null }, userId);
  }
  res.json(projectJSON(p as Parameters<typeof projectJSON>[0]));
});

export const submitProjectForApproval = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "designer" && req.user.role !== "admin") {
    throw new ApiError(403, "Only professionals can mark project work as done");
  }

  const id = parseRequestObjectId(req, "projectId", "project id");
  const project = await ProjectModel.findById(id);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.status === "completed") throw new ApiError(400, "Project is already completed");

  const hasPreview = await AssetModel.exists({ projectId: id, tags: "preview" });
  if (!hasPreview) throw new ApiError(400, "Send a PNG preview before marking this project all done");

  project.status = "pending";
  await project.save();
  await updateLinkedBriefStatus(project.briefId, "pending");

  res.json(projectJSON(project.toObject()));
});

export const approveProjectCompletion = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "projectId", "project id");
  const project = await ProjectModel.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  const userId = parseObjectId(req.user.id, "user id");
  const isOwner = project.ownerId?.equals(userId);
  if (req.user.role !== "admin" && !(req.user.role === "client" && isOwner)) {
    throw new ApiError(403, "Only the client can approve and close this project");
  }
  if (project.status !== "pending") {
    throw new ApiError(400, "Project must be pending client approval before it can be completed");
  }

  project.status = "completed";
  await project.save();
  await updateLinkedBriefStatus(project.briefId, "completed");
  await recordProjectPayment(project, userId);

  res.json(projectJSON(project.toObject()));
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
