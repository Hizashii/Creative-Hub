import { Schema, model, type InferSchemaType } from "mongoose";

const columnSchema = new Schema ({
    id: {type: String, required: true},
    project_id: { type: String, required: true},
    title: { type: String, required: true},
    sort_order: { type: [Number], required: true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

export type Column = InferSchemaType<typeof columnSchema>;

export const ColumnModel = model<Column>("Column", columnSchema);
