import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);
// TODO: add column endpoints
router.get("/", (_req, res) => res.json({ message: "Columns routes placeholder" }));

export default router;
