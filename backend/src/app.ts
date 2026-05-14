import "./types/express-augment";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { openapiDocument } from "./config/openapi";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import briefsRoutes from "./routes/briefs.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument as never));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/briefs", briefsRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
