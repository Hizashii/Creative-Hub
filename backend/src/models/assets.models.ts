import { Schema, model, type InferSchemaType } from "mongoose";

const assetsSchema = new Schema({
    project_id: {type: String, required: true},
    uploader_id: { type: String, required: true},
    url: { type: String, required: true},
    filename: { type: String, required: true},
    tags: { type: [String], required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

export type Asset = InferSchemaType<typeof assetsSchema>;

export const AssetModel = model<Asset>("Asset", assetsSchema);
