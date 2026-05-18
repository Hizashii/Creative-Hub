import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { BriefModel } from "../models/brief.models";
import { ProjectModel } from "../models/projects.models";
import { ColumnModel } from "../models/columns.models";
import { MemberModel } from "../models/project_memebers.models";
import { UserModel } from "../models/user.models";
import { parseRequestObjectId } from "../utils/routeParams";
import { parseObjectId } from "../utils/mongoose";
import { getAccessibleProjectIds } from "../services/accessibleProjects";
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
  const deadline = b.deadline instanceof Date ? b.deadline : (b.deadline ? new Date(b.deadline as unknown as string) : null);
  return {
    id: String(b._id),
    clientId: String(b.clientId),
    title: b.title,
    companyName: b.companyName,
    designType: b.designType,
    description: b.description,
    targetAudience: b.targetAudience,
    stylePreference: b.stylePreference,
    deadline: deadline?.toISOString() ?? new Date().toISOString(),
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

async function getAccessibleBriefIds(userId: Types.ObjectId, role: string) {
  const projectIds = await getAccessibleProjectIds(userId, role);
  if (projectIds.length === 0) return [];
  const projects = await ProjectModel.find({
    _id: { $in: projectIds },
    briefId: { $exists: true, $ne: null },
  })
    .select("briefId")
    .lean();

  return projects
    .map((project) => project.briefId)
    .filter((briefId): briefId is Types.ObjectId => briefId instanceof Types.ObjectId);
}

export const listBriefs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  console.log(`[listBriefs] role=${req.user.role} id=${req.user.id}`);
  let q: Record<string, unknown> = {};
  if (req.user.role === "client") {
    q = { clientId: new Types.ObjectId(req.user.id) };
  }
  if (req.user.role === "designer") {
    const briefIds = await getAccessibleBriefIds(new Types.ObjectId(req.user.id), req.user.role);
    q = { $or: [{ status: "submitted" }, { _id: { $in: briefIds } }] };
  }
  const items = await BriefModel.find(q).sort({ createdAt: -1 }).lean();
  console.log(`[listBriefs] returning ${items.length} brief(s), statuses:`, items.map(b => b.status));
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
  if (req.user.role === "designer") {
    const briefIds = await getAccessibleBriefIds(new Types.ObjectId(req.user.id), req.user.role);
    if (b.status !== "submitted" && !briefIds.some((briefId) => briefId.equals(id))) throw new ApiError(403, "Forbidden");
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

  const ownerId = new Types.ObjectId(req.user.id);

  const brief = await BriefModel.create({
    clientId: ownerId,
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

  // Create a draft project so designers can see and pick it up.
  // Wrapped in try/catch — if this fails for any reason, the brief is still saved.
  try {
    const project = await ProjectModel.create({
      title: brief.title,
      description: brief.description ?? "",
      status: "draft",
      ownerId,
      briefId: brief._id,
      price: brief.budget ?? undefined,
    });
    await MemberModel.create({ projectId: project._id, userId: ownerId, memberRole: "lead" });
    const defaultColumns = ["Backlog", "In progress", "Review", "Done"];
    for (let i = 0; i < defaultColumns.length; i++) {
      await ColumnModel.create({ projectId: project._id, title: defaultColumns[i], order: i });
    }
    console.log(`[createBrief] Draft project created for brief "${brief.title}"`);
  } catch (e) {
    console.error("[createBrief] Could not create draft project (brief still saved):", e);
  }

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
  const currentUser = await UserModel.findById(req.user.id).select("role").lean();
  if (!currentUser) throw new ApiError(401, "User not found");
  const currentRole = (currentUser as { role: string }).role;
  if (currentRole !== "admin" && currentRole !== "designer") {
    throw new ApiError(403, "Only professionals can pick up requirements");
  }

  const id = parseRequestObjectId(req, "id", "brief id");
  const { designerUserId } = req.body as { designerUserId?: string };

  const brief = await BriefModel.findById(id);
  if (!brief) throw new ApiError(404, "Brief not found");
  if (brief.status !== "submitted") {
    throw new ApiError(400, "Only submitted briefs can be accepted");
  }

  const assignedDesignerId =
    currentRole === "admin" && designerUserId
      ? parseObjectId(designerUserId, "designer id")
      : currentRole === "admin"
        ? null
      : designerUserId
        ? parseObjectId(designerUserId, "designer id")
        : new Types.ObjectId(req.user.id);

  const ownerId = brief.clientId as Types.ObjectId;

  // If a draft project was auto-created on brief submission, reuse it.
  let project = await ProjectModel.findOne({ briefId: brief._id });

  if (project) {
    project.status = "in_progress";
    await project.save();
  } else {
    // Fallback: brief was submitted before auto-project creation — create the project now.
    project = await ProjectModel.create({
      title: brief.title,
      description: brief.description,
      status: "in_progress",
      ownerId,
      briefId: brief._id,
      price: brief.budget ?? undefined,
    });
    await MemberModel.create({ projectId: project._id, userId: ownerId, memberRole: "lead" });
    const defaultColumns = ["Backlog", "In progress", "Review", "Done"];
    for (let i = 0; i < defaultColumns.length; i++) {
      await ColumnModel.create({ projectId: project._id, title: defaultColumns[i], order: i });
    }
  }

  if (assignedDesignerId) {
    const alreadyMember = await MemberModel.findOne({ projectId: project._id, userId: assignedDesignerId });
    if (!alreadyMember) {
      await MemberModel.create({ projectId: project._id, userId: assignedDesignerId, memberRole: "member" });
    }
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
