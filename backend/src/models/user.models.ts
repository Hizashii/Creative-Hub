import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema({
    id: {type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    name: { type: String, required: true},
    role: { type: String, required: true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model<User>("User", userSchema);
