import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as dashboard from "../controllers/dashboard.controller";

const router = Router();
router.use(requireAuth);
router.get("/feed", dashboard.activityFeed);
router.get("/my-tasks", dashboard.listMyTasks);
router.get("/calendar", dashboard.calendar);
router.get("/documents", dashboard.listDocuments);
router.get("/leads", dashboard.listLeads);
router.get("/clients", dashboard.listClientDirectory);
router.get("/collaborators", dashboard.listCollaborators);
router.get("/designers", dashboard.listDesigners);

export default router;
