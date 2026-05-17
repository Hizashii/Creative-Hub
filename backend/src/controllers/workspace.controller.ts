import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ColumnModel } from "../models/columns.models";
import { TaskModel } from "../models/tasks.models";
import { MemberModel } from "../models/project_memebers.models";
import { AssetModel } from "../models/assets.models";
import { ProjectModel } from "../models/projects.models";
import { UserModel } from "../models/user.models";
import { parseObjectId } from "../utils/mongoose";
import { parseRequestObjectId } from "../utils/routeParams";

function colJSON(c: { _id: unknown; title: string; order: number; createdAt?: Date }) {
  return {
    id: String(c._id),
    title: c.title,
    order: c.order,
    createdAt: c.createdAt?.toISOString(),
  };
}

function taskJSON(t: {
  _id: unknown;
  projectId: unknown;
  columnId: unknown;
  title: string;
  description?: string;
  assigneeId?: unknown;
  dueDate?: Date | null;
  order: number;
  labels?: string[];
  createdAt?: Date;
}) {
  return {
    id: String(t._id),
    projectId: String(t.projectId),
    columnId: String(t.columnId),
    title: t.title,
    description: t.description ?? "",
    assigneeId: t.assigneeId ? String(t.assigneeId) : undefined,
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    order: t.order,
    labels: t.labels ?? [],
    createdAt: t.createdAt?.toISOString(),
  };
}

function memberJSON(m: {
  _id: unknown;
  projectId: unknown;
  userId: unknown;
  memberRole: string;
  createdAt?: Date;
}) {
  return {
    id: String(m._id),
    projectId: String(m.projectId),
    userId: String(m.userId),
    memberRole: m.memberRole,
    createdAt: m.createdAt?.toISOString(),
  };
}

function assetJSON(a: {
  _id: unknown;
  projectId: unknown;
  uploaderId: unknown;
  url: string;
  filename: string;
  tags?: string[];
  createdAt?: Date;
}) {
  return {
    id: String(a._id),
    projectId: String(a.projectId),
    uploaderId: String(a.uploaderId),
    url: a.url,
    filename: a.filename,
    tags: a.tags ?? [],
    createdAt: a.createdAt?.toISOString(),
  };
}

const pid = (req: Request) => parseRequestObjectId(req, "projectId", "project id");

/* Columns */

export const listColumns = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const cols = await ColumnModel.find({ projectId }).sort({ order: 1 }).lean();
  res.json(cols.map((c) => colJSON(c as Parameters<typeof colJSON>[0])));
});

export const createColumn = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const { title, order } = req.body as { title: string; order?: number };
  const maxOrder = await ColumnModel.findOne({ projectId }).sort({ order: -1 }).select("order").lean();
  const nextOrder = order ?? (maxOrder ? (maxOrder as { order: number }).order + 1 : 0);
  const col = await ColumnModel.create({ projectId, title, order: nextOrder });
  res.status(201).json(colJSON(col.toObject()));
});

export const updateColumn = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const columnId = parseRequestObjectId(req, "columnId", "column id");
  const { title, order } = req.body as { title?: string; order?: number };
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (order !== undefined) updates.order = order;
  const col = await ColumnModel.findOneAndUpdate({ _id: columnId, projectId }, { $set: updates }, { new: true }).lean();
  if (!col) throw new ApiError(404, "Column not found");
  res.json(colJSON(col as Parameters<typeof colJSON>[0]));
});

export const deleteColumn = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const columnId = parseRequestObjectId(req, "columnId", "column id");
  const col = await ColumnModel.findOneAndDelete({ _id: columnId, projectId });
  if (!col) throw new ApiError(404, "Column not found");
  await TaskModel.deleteMany({ columnId });
  res.status(204).send();
});

/* Tasks */

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const items = await TaskModel.find({ projectId }).sort({ order: 1 }).lean();
  res.json(items.map((t) => taskJSON(t as Parameters<typeof taskJSON>[0])));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const { columnId, title, description, assigneeId, dueDate, order, labels } = req.body as {
    columnId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    order?: number;
    labels?: string[];
  };
  const colId = parseObjectId(columnId, "column id");
  const col = await ColumnModel.findOne({ _id: colId, projectId }).lean();
  if (!col) throw new ApiError(400, "Invalid column for this project");

  const task = await TaskModel.create({
    projectId,
    columnId: colId,
    title,
    description: description ?? "",
    assigneeId: assigneeId ? new Types.ObjectId(assigneeId) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    order: order ?? 0,
    labels: labels ?? [],
  });
  res.status(201).json(taskJSON(task.toObject()));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const taskId = parseRequestObjectId(req, "taskId", "task id");
  const body = req.body as {
    columnId?: string;
    title?: string;
    description?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    order?: number;
    labels?: string[];
  };

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.order !== undefined) updates.order = body.order;
  if (body.labels !== undefined) updates.labels = body.labels;
  if (body.assigneeId !== undefined) {
    updates.assigneeId = body.assigneeId ? new Types.ObjectId(body.assigneeId) : null;
  }
  if (body.dueDate !== undefined) {
    updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }
  if (body.columnId !== undefined) {
    const colId = parseObjectId(body.columnId, "column id");
    const col = await ColumnModel.findOne({ _id: colId, projectId }).lean();
    if (!col) throw new ApiError(400, "Invalid column for this project");
    updates.columnId = colId;
  }

  const task = await TaskModel.findOneAndUpdate({ _id: taskId, projectId }, { $set: updates }, { new: true }).lean();
  if (!task) throw new ApiError(404, "Task not found");
  res.json(taskJSON(task as Parameters<typeof taskJSON>[0]));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const taskId = parseRequestObjectId(req, "taskId", "task id");
  const t = await TaskModel.findOneAndDelete({ _id: taskId, projectId });
  if (!t) throw new ApiError(404, "Task not found");
  res.status(204).send();
});

/* Members */

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const items = await MemberModel.find({ projectId }).lean();
  const users = await UserModel.find({
    _id: { $in: items.map((m) => m.userId) },
  })
    .select("name email role")
    .lean();

  const byId = new Map(
    users.map((u: { _id: Types.ObjectId; name: string; email: string; role: string }) => [String(u._id), u] as const)
  );

  res.json(
    items.map((m) => ({
      ...memberJSON(m as Parameters<typeof memberJSON>[0]),
      user: byId.get(String(m.userId)),
    }))
  );
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const projectId = pid(req);
  const project = await ProjectModel.findById(projectId).select("ownerId").lean();
  if (!project) throw new ApiError(404, "Project not found");
  const requester = new Types.ObjectId(req.user.id);
  const isOwner = project.ownerId?.equals(requester);
  const requesterMember = await MemberModel.findOne({ projectId, userId: requester }).select("memberRole").lean();
  const canInvite = req.user.role === "admin" || isOwner || (req.user.role === "designer" && requesterMember);
  if (!canInvite) throw new ApiError(403, "Only project members, the owner, or an admin can add members");

  const { userId, memberRole } = req.body as { userId: string; memberRole?: "lead" | "member" | "viewer" };
  const uid = parseObjectId(userId, "user id");
  const user = await UserModel.findById(uid).lean();
  if (!user) throw new ApiError(404, "User not found");
  if (req.user.role === "designer" && (user as { role: string }).role !== "designer") {
    throw new ApiError(403, "Designers can only invite other designers");
  }

  try {
    const m = await MemberModel.create({
      projectId,
      userId: uid,
      memberRole: memberRole ?? "member",
    });
    res.status(201).json(memberJSON(m.toObject()));
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      throw new ApiError(409, "User is already a member");
    }
    throw err;
  }
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const projectId = pid(req);
  const project = await ProjectModel.findById(projectId).select("ownerId").lean();
  if (!project) throw new ApiError(404, "Project not found");
  const requester = new Types.ObjectId(req.user.id);
  const isOwner = project.ownerId?.equals(requester);
  if (req.user.role !== "admin" && !isOwner) throw new ApiError(403, "Forbidden");

  const userId = parseRequestObjectId(req, "userId", "user id");
  if (project.ownerId?.equals(userId)) throw new ApiError(400, "Cannot remove the project owner from members");

  const m = await MemberModel.findOneAndDelete({ projectId, userId });
  if (!m) throw new ApiError(404, "Member not found");
  res.status(204).send();
});

/* Assets */

export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const items = await AssetModel.find({ projectId }).sort({ createdAt: -1 }).lean();
  res.json(items.map((a) => assetJSON(a as Parameters<typeof assetJSON>[0])));
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const projectId = pid(req);
  const { url, filename, tags } = req.body as { url: string; filename: string; tags?: string[] };
  const uploaderId = new Types.ObjectId(req.user.id);
  const asset = await AssetModel.create({
    projectId,
    uploaderId,
    url,
    filename,
    tags: tags ?? [],
  });
  res.status(201).json(assetJSON(asset.toObject()));
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const projectId = pid(req);
  const assetId = parseRequestObjectId(req, "assetId", "asset id");
  const a = await AssetModel.findOneAndDelete({ _id: assetId, projectId });
  if (!a) throw new ApiError(404, "Asset not found");
  res.status(204).send();
});
