import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ProjectModel } from "../models/projects.models";

export const listProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await ProjectModel.find().lean();
  res.json(projects);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectModel.findById(req.params.id).lean();
  if (!project) throw new ApiError(404, "Project not found");
  res.json(project);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { title, description } = req.body;
  if (!title || !description) throw new ApiError(400, "title and description required");
  const project = await ProjectModel.create({
    id: crypto.randomUUID(),
    title,
    description,
    owner_id: req.user.id,
  });
  res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectModel.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updated_at: new Date() },
    { new: true }
  ).lean();
  if (!project) throw new ApiError(404, "Project not found");
  res.json(project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await ProjectModel.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Project not found");
  res.status(204).send();
});
