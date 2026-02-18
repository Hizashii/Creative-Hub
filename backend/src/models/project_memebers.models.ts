import { Schema, model, type InferSchemaType } from "mongoose";

const membersSchema = new Schema({
  project_id: { type: String, required: true },
  user_id: { type: String, required: true },
  member_role: { type: String, required: true },
  joined_at: { type: Date, default: Date.now },
})

export type Member = InferSchemaType<typeof membersSchema>;

export const MemberModel = model<Member>("Member", membersSchema);
