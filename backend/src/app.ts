import express from "express";
import cors from "cors";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import columnRoutes from "./routes/columns.routes";
import taskRoutes from "./routes/tasks.routes";
import assetRoutes from "./routes/assets.routes";
import memberRoutes from "./routes/members.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/members", memberRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;
