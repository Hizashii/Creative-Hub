import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import * as projectsController from "../controllers/projects.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { patchUserRoleBody } from "../schemas/validation";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", usersController.listUsers);
router.patch("/users/:id/role", validateBody(patchUserRoleBody), usersController.updateUserRole);
router.delete("/users/:id", usersController.deleteUser);
router.get("/projects", projectsController.adminListProjects);

export default router;
