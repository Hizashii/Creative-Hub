import { Schema, model, type InferSchemaType } from "mongoose";

const memberRoles = ["lead", "member", "viewer"] as const;

const membersSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    memberRole: { type: String, enum: memberRoles, default: "member" },
  },
  { timestamps: true }
);

membersSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export type MemberDoc = InferSchemaType<typeof membersSchema>;
export const MemberModel = model<MemberDoc>("Member", membersSchema);
