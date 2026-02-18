import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);
// TODO: add task endpoints
router.get("/", (_req, res) => res.json({ message: "Tasks routes placeholder" }));

export default router;
