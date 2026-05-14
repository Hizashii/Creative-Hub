import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { createInvoiceBody, patchInvoiceBody } from "../schemas/validation";
import * as invoices from "../controllers/invoices.controller";

const router = Router();
router.use(requireAuth);
router.get("/", invoices.listInvoices);
router.post("/", requireRole("admin", "designer"), validateBody(createInvoiceBody), invoices.createInvoice);
router.patch("/:id", requireRole("admin", "designer"), validateBody(patchInvoiceBody), invoices.updateInvoice);
router.delete("/:id", requireRole("admin", "designer"), invoices.deleteInvoice);

export default router;
