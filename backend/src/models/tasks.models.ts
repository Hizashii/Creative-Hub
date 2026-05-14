import { Schema, model, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    columnId: { type: Schema.Types.ObjectId, ref: "Column", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    dueDate: { type: Date, required: false },
    order: { type: Number, default: 0 },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type TaskDoc = InferSchemaType<typeof taskSchema>;
export const TaskModel = model<TaskDoc>("Task", taskSchema);
