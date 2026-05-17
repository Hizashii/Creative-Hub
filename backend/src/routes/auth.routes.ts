import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { loginBody, registerBody } from "../schemas/validation";
import { authRateLimiter } from "../security/rate-limit/rateLimiters";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerBody), authController.register);
router.post("/login", authRateLimiter, validateBody(loginBody), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
