import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { loginBody, registerBody } from "../schemas/validation";

const router = Router();

router.post("/register", validateBody(registerBody), authController.register);
router.post("/login", validateBody(loginBody), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
