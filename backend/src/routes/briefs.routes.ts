import { Router } from "express";
import * as briefsController from "../controllers/briefs.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import {
  createBriefBody,
  updateBriefBody,
  acceptBriefBody,
} from "../schemas/validation";

const router = Router();

router.get("/", requireAuth, briefsController.listBriefs);
router.get("/:id", requireAuth, briefsController.getBrief);
router.post("/", requireAuth, validateBody(createBriefBody), briefsController.createBrief);
router.patch("/:id", requireAuth, validateBody(updateBriefBody), briefsController.updateBrief);
router.put("/:id", requireAuth, validateBody(updateBriefBody), briefsController.updateBrief);
router.delete("/:id", requireAuth, briefsController.deleteBrief);
router.post(
  "/:id/accept",
  requireAuth,
  validateBody(acceptBriefBody),
  briefsController.acceptBrief
);

export default router;
