import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { BriefModel } from "../models/brief.models";
import { ProjectModel } from "../models/projects.models";
import { ColumnModel } from "../models/columns.models";
import { MemberModel } from "../models/project_memebers.models";
import { parseRequestObjectId } from "../utils/routeParams";
import { parseObjectId } from "../utils/mongoose";
import { updateBriefBody } from "../schemas/validation";

type BriefLean = {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  title: string;
  companyName: string;
  designType: string;
  description: string;
  targetAudience: string;
  stylePreference: string;
  deadline: Date;
  budget?: number | null;
  references: string[];
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateBriefInput = z.infer<typeof updateBriefBody>;

function briefToJSON(b: BriefLean) {
  return {
    id: String(b._id),
    clientId: String(b.clientId),
    title: b.title,
    companyName: b.companyName,
    designType: b.designType,
    description: b.description,
    targetAudience: b.targetAudience,
    stylePreference: b.stylePreference,
    deadline: b.deadline.toISOString(),
    budget: b.budget ?? undefined,
    references: b.references ?? [],
    status: b.status,
    createdAt: b.createdAt?.toISOString(),
    updatedAt: b.updatedAt?.toISOString(),
  };
}

function toBriefLean(doc: unknown): BriefLean {
  const b = doc as BriefLean;
  return b;
}

export const listBriefs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const q =
    req.user.role === "client"
      ? { clientId: new Types.ObjectId(req.user.id) }
      : {};
  const items = await BriefModel.find(q).sort({ createdAt: -1 }).lean();
  res.json(items.map((row: unknown) => briefToJSON(toBriefLean(row))));
});

export const getBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "id", "brief id");
  const b = await BriefModel.findById(id).lean();
  if (!b) throw new ApiError(404, "Brief not found");
  if (req.user.role === "client" && b.clientId.toString() !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  res.json(briefToJSON(toBriefLean(b)));
});

export const createBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "client") throw new ApiError(403, "Only clients can submit briefs");

  const body = req.body as {
    title: string;
    companyName: string;
    designType: string;
    description: string;
    targetAudience: string;
    stylePreference: string;
    deadline: Date;
    budget?: number;
    references?: string[];
  };

  const brief = await BriefModel.create({
    clientId: new Types.ObjectId(req.user.id),
    title: body.title,
    companyName: body.companyName,
    designType: body.designType,
    description: body.description,
    targetAudience: body.targetAudience,
    stylePreference: body.stylePreference,
    deadline: body.deadline instanceof Date ? body.deadline : new Date(body.deadline as unknown as string),
    budget: body.budget,
    references: body.references ?? [],
    status: "submitted",
  });

  res.status(201).json(briefToJSON(toBriefLean(brief.toObject())));
});

function buildBriefUpdate(body: UpdateBriefInput, role: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(body)) {
    if (v === undefined) continue;
    if (key === "status" && role !== "admin") continue;
    out[key] = v;
  }
  return out;
}

export const updateBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "id", "brief id");
  const existing = await BriefModel.findById(id).lean();
  if (!existing) throw new ApiError(404, "Brief not found");
  if (req.user.role === "client" && existing.clientId.toString() !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (req.user.role === "client" && !["submitted"].includes(existing.status)) {
    throw new ApiError(400, "Brief can no longer be edited");
  }

  const body = req.body as UpdateBriefInput;
  const $set = buildBriefUpdate(body, req.user.role);
  if (Object.keys($set).length === 0) {
    res.json(briefToJSON(toBriefLean(existing)));
    return;
  }

  await BriefModel.updateOne({ _id: id }, { $set });
  const fresh = await BriefModel.findById(id).lean();
  if (!fresh) throw new ApiError(404, "Brief not found");
  res.json(briefToJSON(toBriefLean(fresh)));
});

export const deleteBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = parseRequestObjectId(req, "id", "brief id");
  const b = await BriefModel.findById(id).lean();
  if (!b) throw new ApiError(404, "Brief not found");
  if (req.user.role === "client" && b.clientId.toString() !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (req.user.role === "client" && b.status !== "submitted") {
    throw new ApiError(400, "Cannot delete processed brief");
  }
  await BriefModel.deleteOne({ _id: id });
  res.status(204).send();
});

export const acceptBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "admin" && req.user.role !== "designer") throw new ApiError(403, "Forbidden");

  const id = parseRequestObjectId(req, "id", "brief id");
  const { designerUserId } = req.body as { designerUserId?: string };

  const brief = await BriefModel.findById(id);
  if (!brief) throw new ApiError(404, "Brief not found");
  if (brief.status !== "submitted") {
    throw new ApiError(400, "Only submitted briefs can be accepted");
  }

  const existingProject = await ProjectModel.findOne({ briefId: brief._id }).lean();
  if (existingProject) throw new ApiError(400, "Brief already has a project");

  const ownerId = brief.clientId as Types.ObjectId;
  const project = await ProjectModel.create({
    title: brief.title,
    description: brief.description,
    status: "in_progress",
    ownerId,
    briefId: brief._id,
  });

  await MemberModel.create({
    projectId: project._id,
    userId: ownerId,
    memberRole: "lead",
  });

  const assignedDesignerId =
    req.user.role === "designer"
      ? new Types.ObjectId(req.user.id)
      : designerUserId
        ? parseObjectId(designerUserId, "designer id")
        : null;

  if (assignedDesignerId) {
    await MemberModel.create({
      projectId: project._id,
      userId: assignedDesignerId,
      memberRole: "member",
    });
  }

  const defaultColumns = ["Backlog", "In progress", "Review", "Done"];
  for (let i = 0; i < defaultColumns.length; i++) {
    await ColumnModel.create({
      projectId: project._id,
      title: defaultColumns[i],
      order: i,
    });
  }

  brief.status = "in-progress";
  await brief.save();

  res.status(201).json({
    project: {
      id: String(project._id),
      title: project.title,
      status: project.status,
      ownerId: String(project.ownerId),
      briefId: String(project.briefId),
    },
    brief: briefToJSON(toBriefLean(brief.toObject())),
  });
});
