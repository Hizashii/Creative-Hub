import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);
// TODO: add member endpoints
router.get("/", (_req, res) => res.json({ message: "Members routes placeholder" }));

export default router;
