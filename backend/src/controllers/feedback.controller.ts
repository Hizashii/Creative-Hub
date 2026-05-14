import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { FeedbackModel } from "../models/feedback.models";
import { parseObjectId } from "../utils/mongoose";
import { parseRequestObjectId } from "../utils/routeParams";
import { skipAuthBypass } from "../utils/skipAuthBypass";

function feedbackJSON(f: {
  _id: unknown;
  projectId: unknown;
  authorId: unknown;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(f._id),
    projectId: String(f.projectId),
    authorId: String(f.authorId),
    message: f.message,
    createdAt: f.createdAt?.toISOString(),
    updatedAt: f.updatedAt?.toISOString(),
  };
}

export const listFeedback = asyncHandler(async (req: Request, res: Response) => {
  const projectId = parseRequestObjectId(req, "projectId", "project id");
  const items = await FeedbackModel.find({ projectId }).sort({ createdAt: 1 }).lean();
  res.json(items.map(feedbackJSON));
});

export const createFeedback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const projectId = parseRequestObjectId(req, "projectId", "project id");
  const { message } = req.body as { message: string };

  const feedback = await FeedbackModel.create({
    projectId,
    authorId: parseObjectId(req.user.id, "user id"),
    message,
  });

  res.status(201).json(feedbackJSON(feedback.toObject()));
});

export const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const projectId = parseRequestObjectId(req, "projectId", "project id");
  const feedbackId = parseRequestObjectId(req, "feedbackId", "feedback id");

  const fb = await FeedbackModel.findOne({ _id: feedbackId, projectId }).lean();
  if (!fb) throw new ApiError(404, "Feedback not found");

  const user = req.user;
  if (
    !skipAuthBypass() &&
    user.role !== "admin" &&
    fb.authorId.toString() !== user.id
  ) {
    throw new ApiError(403, "Forbidden");
  }

  await FeedbackModel.findOneAndDelete({ _id: feedbackId, projectId });
  res.status(204).send();
});
