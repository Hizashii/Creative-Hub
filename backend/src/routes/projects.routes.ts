import { Router } from "express";
import * as projectController from "../controllers/projects.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, projectController.listProjects);
router.post("/", requireAuth, projectController.createProject);
router.get("/:id", requireAuth, projectController.getProject);
router.patch("/:id", requireAuth, projectController.updateProject);
router.delete("/:id", requireAuth, projectController.deleteProject);

export default router;
