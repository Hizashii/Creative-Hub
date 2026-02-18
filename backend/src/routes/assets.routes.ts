import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);
// TODO: add asset endpoints
router.get("/", (_req, res) => res.json({ message: "Assets routes placeholder" }));

export default router;
