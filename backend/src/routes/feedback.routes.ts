import { Router } from "express";
import * as feedbackController from "../controllers/feedback.controller";
import { validateBody } from "../middleware/validateBody";
import { createFeedbackBody } from "../schemas/validation";

const router = Router({ mergeParams: true });

router.get("/", feedbackController.listFeedback);
router.post("/", validateBody(createFeedbackBody), feedbackController.createFeedback);
router.delete("/:feedbackId", feedbackController.deleteFeedback);

export default router;
