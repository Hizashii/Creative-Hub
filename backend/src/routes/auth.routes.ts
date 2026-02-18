import { Router } from "express";

const router = Router();

// TODO: add auth endpoints
router.get("/me", (_req, res) => res.json({ message: "Auth routes placeholder" }));

export default router;
