import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireProjectAccess } from "../middleware/requireProjectAccess";
import { validateBody } from "../middleware/validateBody";
import {
  addMemberBody,
  createAssetBody,
  createColumnBody,
  createProjectBody,
  createTaskBody,
  patchColumnBody,
  patchProjectBody,
  patchTaskBody,
} from "../schemas/validation";
import * as projects from "../controllers/projects.controller";
import * as workspace from "../controllers/workspace.controller";
import feedbackRoutes from "./feedback.routes";

const router = Router();

router.use(requireAuth);
router.get("/", projects.listProjects);
router.post("/", validateBody(createProjectBody), projects.createProject);

const byProject = Router({ mergeParams: true });
byProject.use(requireProjectAccess);

byProject.get("/", projects.getProject);
byProject.patch("/", validateBody(patchProjectBody), projects.updateProject);
byProject.delete("/", projects.deleteProject);

byProject.get("/columns", workspace.listColumns);
byProject.post("/columns", validateBody(createColumnBody), workspace.createColumn);
byProject.patch("/columns/:columnId", validateBody(patchColumnBody), workspace.updateColumn);
byProject.delete("/columns/:columnId", workspace.deleteColumn);

byProject.get("/tasks", workspace.listTasks);
byProject.post("/tasks", validateBody(createTaskBody), workspace.createTask);
byProject.patch("/tasks/:taskId", validateBody(patchTaskBody), workspace.updateTask);
byProject.delete("/tasks/:taskId", workspace.deleteTask);

byProject.get("/members", workspace.listMembers);
byProject.post("/members", validateBody(addMemberBody), workspace.addMember);
byProject.delete("/members/:userId", workspace.removeMember);

byProject.get("/assets", workspace.listAssets);
byProject.post("/assets", validateBody(createAssetBody), workspace.createAsset);
byProject.delete("/assets/:assetId", workspace.deleteAsset);

byProject.use("/feedback", feedbackRoutes);

router.use("/:projectId", byProject);

export default router;
