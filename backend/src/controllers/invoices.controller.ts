import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { InvoiceModel } from "../models/invoice.models";
import { ProjectModel } from "../models/projects.models";
import { parseObjectId } from "../utils/mongoose";
import { parseRequestObjectId } from "../utils/routeParams";
import { getAccessibleProjectIds } from "../services/accessibleProjects";
import { ensurePaidInvoicesForProjects } from "../services/projectPayment";

function invoiceJSON(inv: {
  _id: unknown;
  createdById: unknown;
  clientUserId?: unknown;
  projectId?: unknown;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  status: string;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}, projectTitle?: string) {
  return {
    id: String(inv._id),
    createdById: String(inv.createdById),
    clientUserId: inv.clientUserId ? String(inv.clientUserId) : undefined,
    projectId: inv.projectId ? String(inv.projectId) : undefined,
    projectTitle,
    title: inv.title,
    description: inv.description ?? "",
    amount: inv.amount,
    currency: inv.currency ?? "USD",
    status: inv.status,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : undefined,
    createdAt: inv.createdAt?.toISOString(),
    updatedAt: inv.updatedAt?.toISOString(),
  };
}

async function canDesignerMutateInvoice(userId: Types.ObjectId, inv: { createdById: Types.ObjectId; projectId?: Types.ObjectId | null }) {
  if (inv.createdById.equals(userId)) return true;
  if (!inv.projectId) return false;
  const pids = await getAccessibleProjectIds(userId, "designer");
  return pids.some((p) => p.equals(inv.projectId!));
}

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const userId = parseObjectId(req.user.id, "user id");
  let filter: Record<string, unknown> = {};
  let paymentProjectIds: Types.ObjectId[] | undefined;
  if (req.user.role === "admin") {
    filter = {};
  } else if (req.user.role === "designer") {
    const pids = await getAccessibleProjectIds(userId, req.user.role);
    paymentProjectIds = pids;
    filter = {
      $or: [{ createdById: userId }, { projectId: { $in: pids } }],
    };
  } else {
    const ownedProjectIds = await ProjectModel.find({ ownerId: userId }).distinct("_id");
    paymentProjectIds = ownedProjectIds;
    filter = {
      $or: [{ clientUserId: userId }, { projectId: { $in: ownedProjectIds } }],
    };
  }

  const completedProjectFilter: Record<string, unknown> = { status: "completed" };
  if (paymentProjectIds) completedProjectFilter._id = { $in: paymentProjectIds };
  const completedProjects = await ProjectModel.find(completedProjectFilter).select("ownerId").lean();
  await ensurePaidInvoicesForProjects(completedProjects as Array<{ _id: unknown; ownerId: unknown }>);

  const rows = await InvoiceModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const projectIds = [...new Set(rows.map((r) => (r.projectId ? String(r.projectId) : null)).filter(Boolean))] as string[];
  const projects =
    projectIds.length > 0
      ? await ProjectModel.find({ _id: { $in: projectIds.map((id) => new Types.ObjectId(id)) } })
          .select("title")
          .lean()
      : [];
  const titleById = new Map(projects.map((p) => [String((p as { _id: Types.ObjectId })._id), (p as { title: string }).title]));

  res.json(
    rows.map((r) =>
      invoiceJSON(r as Parameters<typeof invoiceJSON>[0], r.projectId ? titleById.get(String(r.projectId)) : undefined)
    )
  );
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role === "client") throw new ApiError(403, "Clients cannot create invoices");

  const userId = parseObjectId(req.user.id, "user id");
  const { title, description, amount, currency, status, dueDate, projectId, clientUserId } = req.body as {
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    status?: string;
    dueDate?: string | null;
    projectId?: string | null;
    clientUserId?: string | null;
  };

  let pid: Types.ObjectId | undefined;
  if (projectId) {
    pid = parseObjectId(projectId, "project id");
    const pids = await getAccessibleProjectIds(userId, req.user.role);
    if (req.user.role !== "admin" && !pids.some((p) => p.equals(pid!))) {
      throw new ApiError(403, "No access to this project");
    }
  }

  let cid: Types.ObjectId | undefined;
  if (clientUserId) {
    cid = parseObjectId(clientUserId, "client user id");
  }

  const inv = await InvoiceModel.create({
    createdById: userId,
    projectId: pid,
    clientUserId: cid,
    title,
    description: description ?? "",
    amount,
    currency: currency ?? "USD",
    status: (status as "draft" | "sent" | "paid" | "void") ?? "draft",
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  let projectTitle: string | undefined;
  if (inv.projectId) {
    const p = await ProjectModel.findById(inv.projectId).select("title").lean();
    projectTitle = p ? (p as { title: string }).title : undefined;
  }

  res.status(201).json(invoiceJSON(inv.toObject() as Parameters<typeof invoiceJSON>[0], projectTitle));
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role === "client") throw new ApiError(403, "Forbidden");

  const id = parseRequestObjectId(req, "id", "invoice id");
  const inv = await InvoiceModel.findById(id).lean();
  if (!inv) throw new ApiError(404, "Invoice not found");

  const userId = parseObjectId(req.user.id, "user id");
  if (req.user.role === "designer") {
    const ok = await canDesignerMutateInvoice(userId, inv as { createdById: Types.ObjectId; projectId?: Types.ObjectId | null });
    if (!ok) throw new ApiError(403, "Forbidden");
  }

  const body = req.body as {
    title?: string;
    description?: string;
    amount?: number;
    currency?: string;
    status?: string;
    dueDate?: string | null;
    projectId?: string | null;
    clientUserId?: string | null;
  };

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.status !== undefined) updates.status = body.status;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.projectId !== undefined) {
    if (body.projectId === null) updates.projectId = null;
    else {
      const pid = parseObjectId(body.projectId, "project id");
      const pids = await getAccessibleProjectIds(userId, req.user.role);
      if (req.user.role !== "admin" && !pids.some((p) => p.equals(pid))) throw new ApiError(403, "No access to this project");
      updates.projectId = pid;
    }
  }
  if (body.clientUserId !== undefined) {
    updates.clientUserId = body.clientUserId ? parseObjectId(body.clientUserId, "client user id") : null;
  }

  const next = await InvoiceModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!next) throw new ApiError(404, "Invoice not found");

  let projectTitle: string | undefined;
  if (next.projectId) {
    const p = await ProjectModel.findById(next.projectId).select("title").lean();
    projectTitle = p ? (p as { title: string }).title : undefined;
  }

  res.json(invoiceJSON(next as Parameters<typeof invoiceJSON>[0], projectTitle));
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (req.user.role === "client") throw new ApiError(403, "Forbidden");

  const id = parseRequestObjectId(req, "id", "invoice id");
  const inv = await InvoiceModel.findById(id).lean();
  if (!inv) throw new ApiError(404, "Invoice not found");

  const userId = parseObjectId(req.user.id, "user id");
  if (req.user.role === "designer") {
    const ok = await canDesignerMutateInvoice(userId, inv as { createdById: Types.ObjectId; projectId?: Types.ObjectId | null });
    if (!ok) throw new ApiError(403, "Forbidden");
  }

  await InvoiceModel.deleteOne({ _id: id });
  res.status(204).send();
});
