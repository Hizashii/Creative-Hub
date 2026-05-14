import { Schema, model, type InferSchemaType } from "mongoose";

const assetsSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type AssetDoc = InferSchemaType<typeof assetsSchema>;
export const AssetModel = model<AssetDoc>("Asset", assetsSchema);
