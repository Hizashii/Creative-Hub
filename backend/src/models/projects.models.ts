import { Schema, model, type InferSchemaType } from "mongoose";

const projectStatuses = ["draft", "in_progress", "pending", "paused", "completed"] as const;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: projectStatuses,
      default: "in_progress",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    briefId: { type: Schema.Types.ObjectId, ref: "Brief", required: false },
    price: { type: Number, required: false },
  },
  { timestamps: true }
);

export type ProjectDoc = InferSchemaType<typeof projectSchema>;
export type ProjectStatus = (typeof projectStatuses)[number];
export const ProjectModel = model<ProjectDoc>("Project", projectSchema);
