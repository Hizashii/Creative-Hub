import { Schema, model, type InferSchemaType } from "mongoose";

const projectSchema = new Schema({
    id: {type: String, required: true},
    title: { type: String, required: true},
    description: { type: String, required: true},
    owner_id: { type: String, required: true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

export type Project = InferSchemaType<typeof projectSchema>;

export const ProjectModel = model<Project>("Project", projectSchema);
