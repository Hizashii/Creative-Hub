import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ProjectModel } from "../models/projects.models";
import { MemberModel } from "../models/project_memebers.models";
import { TaskModel } from "../models/tasks.models";
import { ColumnModel } from "../models/columns.models";
import { AssetModel } from "../models/assets.models";
import { FeedbackModel } from "../models/feedback.models";
import { BriefModel } from "../models/brief.models";
import { UserModel } from "../models/user.models";
import { parseObjectId } from "../utils/mongoose";
import { getAccessibleProjectIds } from "../services/accessibleProjects";

type FeedKind = "feedback" | "asset" | "task" | "brief";

type FeedItem = {
  kind: FeedKind;
  id: string;
  at: string;
  title: string;
  detail?: string;
  projectId?: string;
  projectTitle?: string;
  authorName?: string;
  companyName?: string;
  status?: string;
  url?: string;
};

async function getVisibleBriefQuery(userId: Types.ObjectId, role: string): Promise<Record<string, unknown>> {
  if (role === "client") return { clientId: userId };
  if (role === "admin") return {};
  if (role !== "designer") return { _id: { $in: [] } };

  const projectIds = await getAccessibleProjectIds(userId, role);
  if (projectIds.length === 0) return { _id: { $in: [] } };

  const projects = await ProjectModel.find({
    _id: { $in: projectIds },
    briefId: { $exists: true, $ne: null },
  })
    .select("briefId")
    .lean();

  const briefIds = projects
    .map((project) => project.briefId)
    .filter((briefId): briefId is Types.ObjectId => briefId instanceof Types.ObjectId);

  return { _id: { $in: briefIds } };
}

export const activityFeed = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  const ids = await getAccessibleProjectIds(userId, req.user.role);
  const projects = await ProjectModel.find({ _id: { $in: ids } })
    .select("title status updatedAt")
    .lean();
  const titleById = new Map(projects.map((p) => [String(p._id), p.title as string]));

  const items: FeedItem[] = [];

  if (ids.length > 0) {
    const [feedback, assets, tasks] = await Promise.all([
      FeedbackModel.find({ projectId: { $in: ids } }).sort({ updatedAt: -1 }).limit(40).lean(),
      AssetModel.find({ projectId: { $in: ids } }).sort({ createdAt: -1 }).limit(35).lean(),
      TaskModel.find({ projectId: { $in: ids } }).sort({ updatedAt: -1 }).limit(40).lean(),
    ]);

    const authorIds = [...new Set(feedback.map((f) => String(f.authorId)))];
    const authors = await UserModel.find({ _id: { $in: authorIds.map((id) => new Types.ObjectId(id)) } })
      .select("name")
      .lean();
    const nameById = new Map(authors.map((a) => [String((a as { _id: Types.ObjectId })._id), (a as { name: string }).name]));

    for (const f of feedback) {
      const at = (f as { updatedAt?: Date; createdAt?: Date }).updatedAt ?? f.createdAt;
      items.push({
        kind: "feedback",
        id: String(f._id),
        at: at?.toISOString() ?? new Date().toISOString(),
        title: "Feedback",
        detail: f.message.length > 200 ? `${f.message.slice(0, 200)}…` : f.message,
        projectId: String(f.projectId),
        projectTitle: titleById.get(String(f.projectId)) ?? "Project",
        authorName: nameById.get(String(f.authorId)),
      });
    }

    for (const a of assets) {
      items.push({
        kind: "asset",
        id: String(a._id),
        at: (a as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
        title: "File uploaded",
        detail: a.filename,
        projectId: String(a.projectId),
        projectTitle: titleById.get(String(a.projectId)) ?? "Project",
        url: a.url,
      });
    }

    for (const t of tasks) {
      const at = (t as { updatedAt?: Date; createdAt?: Date }).updatedAt ?? t.createdAt;
      items.push({
        kind: "task",
        id: String(t._id),
        at: at?.toISOString() ?? new Date().toISOString(),
        title: "Task",
        detail: t.title,
        projectId: String(t.projectId),
        projectTitle: titleById.get(String(t.projectId)) ?? "Project",
      });
    }
  }

  const briefQuery = await getVisibleBriefQuery(userId, req.user.role);
  const briefs = await BriefModel.find(briefQuery).sort({ updatedAt: -1 }).limit(30).lean();
  for (const b of briefs) {
    const at = (b as { updatedAt?: Date; createdAt?: Date }).updatedAt ?? b.createdAt;
    items.push({
      kind: "brief",
      id: String(b._id),
      at: at?.toISOString() ?? new Date().toISOString(),
      title: "Brief",
      detail: b.title,
      companyName: b.companyName,
      status: b.status,
    });
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  res.json(items.slice(0, 80));
});

export const listMyTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  const ids = await getAccessibleProjectIds(userId, req.user.role);
  if (ids.length === 0) {
    res.json([]);
    return;
  }

  const [tasks, projects, columns] = await Promise.all([
    TaskModel.find({ projectId: { $in: ids } }).sort({ updatedAt: -1 }).limit(200).lean(),
    ProjectModel.find({ _id: { $in: ids } }).select("title").lean(),
    ColumnModel.find({ projectId: { $in: ids } }).select("title projectId").lean(),
  ]);

  const projectTitle = new Map(projects.map((p) => [String((p as { _id: Types.ObjectId })._id), (p as { title: string }).title]));
  const columnTitle = new Map(columns.map((c) => [String((c as { _id: Types.ObjectId })._id), (c as { title: string }).title]));

  const assigneeIds = [...new Set(tasks.map((t) => (t.assigneeId ? String(t.assigneeId) : null)).filter(Boolean))] as string[];
  const assignees =
    assigneeIds.length > 0
      ? await UserModel.find({ _id: { $in: assigneeIds.map((id) => new Types.ObjectId(id)) } })
          .select("name")
          .lean()
      : [];
  const assigneeName = new Map(assignees.map((u) => [String((u as { _id: Types.ObjectId })._id), (u as { name: string }).name]));

  res.json(
    tasks.map((t) => ({
      id: String(t._id),
      projectId: String(t.projectId),
      projectTitle: projectTitle.get(String(t.projectId)) ?? "Project",
      columnId: String(t.columnId),
      columnTitle: columnTitle.get(String(t.columnId)) ?? "",
      title: t.title,
      description: t.description ?? "",
      assigneeId: t.assigneeId ? String(t.assigneeId) : undefined,
      assigneeName: t.assigneeId ? assigneeName.get(String(t.assigneeId)) : undefined,
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      labels: t.labels ?? [],
      updatedAt: (t as { updatedAt?: Date }).updatedAt?.toISOString(),
    }))
  );
});

export const calendar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  const ids = await getAccessibleProjectIds(userId, req.user.role);

  const briefQuery = await getVisibleBriefQuery(userId, req.user.role);
  const briefs = await BriefModel.find(briefQuery).select("title companyName deadline status").sort({ deadline: 1 }).lean();

  let tasks: unknown[] = [];
  if (ids.length > 0) {
    const taskRows = await TaskModel.find({
      projectId: { $in: ids },
      dueDate: { $exists: true, $ne: null },
    })
      .sort({ dueDate: 1 })
      .limit(150)
      .lean();
    const projects = await ProjectModel.find({ _id: { $in: ids } }).select("title").lean();
    const projectTitle = new Map(projects.map((p) => [String((p as { _id: Types.ObjectId })._id), (p as { title: string }).title]));
    tasks = taskRows.map((t) => ({
      id: String(t._id),
      projectId: String(t.projectId),
      projectTitle: projectTitle.get(String(t.projectId)) ?? "Project",
      title: t.title,
      dueDate: t.dueDate!.toISOString(),
    }));
  }

  res.json({
    tasks,
    briefs: briefs.map((b) => ({
      id: String(b._id),
      title: b.title,
      companyName: b.companyName,
      deadline: b.deadline.toISOString(),
      status: b.status,
    })),
  });
});

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  const ids = await getAccessibleProjectIds(userId, req.user.role);
  if (ids.length === 0) {
    res.json([]);
    return;
  }
  const assets = await AssetModel.find({ projectId: { $in: ids } }).sort({ createdAt: -1 }).limit(300).lean();
  const projects = await ProjectModel.find({ _id: { $in: ids } }).select("title").lean();
  const projectTitle = new Map(projects.map((p) => [String((p as { _id: Types.ObjectId })._id), (p as { title: string }).title]));

  res.json(
    assets.map((a) => ({
      id: String(a._id),
      projectId: String(a.projectId),
      projectTitle: projectTitle.get(String(a.projectId)) ?? "Project",
      filename: a.filename,
      url: a.url,
      tags: a.tags ?? [],
      createdAt: (a as { createdAt?: Date }).createdAt?.toISOString(),
    }))
  );
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "admin") {
    res.json([]);
    return;
  }
  const items = await BriefModel.find({ status: "submitted" }).sort({ createdAt: -1 }).lean();
  const clientIds = [...new Set(items.map((b) => String(b.clientId)))];
  const clients = await UserModel.find({ _id: { $in: clientIds.map((id) => new Types.ObjectId(id)) } })
    .select("name email")
    .lean();
  const clientById = new Map(clients.map((c) => [String((c as { _id: Types.ObjectId })._id), c as { name: string; email: string }]));

  res.json(
    items.map((b) => {
      const c = clientById.get(String(b.clientId));
      return {
        id: String(b._id),
        title: b.title,
        companyName: b.companyName,
        designType: b.designType,
        deadline: b.deadline.toISOString(),
        status: b.status,
        createdAt: (b as { createdAt?: Date }).createdAt?.toISOString(),
        clientId: String(b.clientId),
        clientName: c?.name,
        clientEmail: c?.email,
      };
    })
  );
});

export const listClientDirectory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role === "admin") {
    const clients = await UserModel.find({ role: "client" }).sort({ name: 1 }).lean();
    const counts = await ProjectModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(
      clients.map((c) => ({
        id: String((c as { _id: Types.ObjectId })._id),
        name: (c as { name: string }).name,
        email: (c as { email: string }).email,
        projectCount: countMap.get(String((c as { _id: Types.ObjectId })._id)) ?? 0,
      }))
    );
    return;
  }

  if (req.user.role === "designer") {
    const designerId = parseObjectId(req.user.id, "user id");
    const projectIds = await MemberModel.find({ userId: designerId }).distinct("projectId");
    const owners = await ProjectModel.find({ _id: { $in: projectIds } }).distinct("ownerId");
    const clients = await UserModel.find({ _id: { $in: owners }, role: "client" }).sort({ name: 1 }).lean();
    const counts = await ProjectModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { ownerId: { $in: clients.map((c) => (c as { _id: Types.ObjectId })._id) } } },
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(
      clients.map((c) => ({
        id: String((c as { _id: Types.ObjectId })._id),
        name: (c as { name: string }).name,
        email: (c as { email: string }).email,
        projectCount: countMap.get(String((c as { _id: Types.ObjectId })._id)) ?? 0,
      }))
    );
    return;
  }

  res.json([]);
});

export const listCollaborators = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "designer") {
    res.json([]);
    return;
  }
  const userId = parseObjectId(req.user.id, "user id");
  const pids = await getAccessibleProjectIds(userId, req.user.role);
  if (pids.length === 0) {
    res.json([]);
    return;
  }
  const memberRows = await MemberModel.find({ projectId: { $in: pids } }).lean();
  const peerIds = [...new Set(memberRows.map((m) => String(m.userId)))].filter((id) => id !== req.user!.id);
  if (peerIds.length === 0) {
    res.json([]);
    return;
  }
  const users = await UserModel.find({ _id: { $in: peerIds.map((id) => new Types.ObjectId(id)) } })
    .select("name email role")
    .sort({ name: 1 })
    .lean();
  res.json(
    users.map((u) => ({
      id: String((u as { _id: Types.ObjectId })._id),
      name: (u as { name: string }).name,
      email: (u as { email: string }).email,
      role: (u as { role: string }).role,
    }))
  );
});

export const listDesigners = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role !== "designer" && req.user.role !== "admin") {
    res.json([]);
    return;
  }

  const users = await UserModel.find({ role: "designer" })
    .select("name email role")
    .sort({ name: 1 })
    .lean();

  res.json(
    users
      .filter((u) => String((u as { _id: Types.ObjectId })._id) !== req.user!.id)
      .map((u) => ({
        id: String((u as { _id: Types.ObjectId })._id),
        name: (u as { name: string }).name,
        email: (u as { email: string }).email,
        role: (u as { role: string }).role,
      }))
  );
});
