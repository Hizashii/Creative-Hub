import "./types/express-augment";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { openapiDocument } from "./config/openapi";
import { applyHttpSecurity, applyParsedBodySecurity } from "./security";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import briefsRoutes from "./routes/briefs.routes";
import adminRoutes from "./routes/admin.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import invoiceRoutes from "./routes/invoices.routes";

const app = express();

applyHttpSecurity(app);
app.use(express.json({ limit: "25mb" }));
applyParsedBodySecurity(app);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument as never));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/briefs", briefsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
