import { Schema, model, type InferSchemaType } from "mongoose";

const tokenSchema = new Schema({
    id: {type: String, required: true},
    user_id: { type: String, required: true},
    // not sure if you hash a token ask Kris.
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date, required: false },
    created_at: { type: Date, default: Date.now },
})

export type Token = InferSchemaType<typeof tokenSchema>;

export const TokenModel = model<Token>("Token", tokenSchema);
