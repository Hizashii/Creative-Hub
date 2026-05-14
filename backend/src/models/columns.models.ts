import { Schema, model, type InferSchemaType } from "mongoose";

const columnSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export type ColumnDoc = InferSchemaType<typeof columnSchema>;
export const ColumnModel = model<ColumnDoc>("Column", columnSchema);
