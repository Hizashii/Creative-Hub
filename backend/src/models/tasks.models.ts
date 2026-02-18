import { Schema, model, type InferSchemaType } from "mongoose";

const taskSchema = new Schema ({
    id: {type: String, required: true},
    project_id: { type: String, required: true},
    column_id: { type: String, required: true},
    title: { type: String, required: true},
    description: { type: String, required: true},
    assignee_id: { type: String, required: false},
    due_date: { type: Date, required: false},
    labels: { type: [String], required: false },
    sort_order: { type: [Number], required: true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

export type Task = InferSchemaType<typeof taskSchema>;

export const TaskModel = model<Task>("Task", taskSchema);
