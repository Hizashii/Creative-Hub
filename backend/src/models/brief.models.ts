import { Schema, model, type InferSchemaType } from "mongoose";

const designTypes = ["logo", "poster", "branding", "social-media", "website"] as const;

const briefStatuses = ["submitted", "accepted", "in-progress", "pending", "completed"] as const;

const briefSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    designType: { type: String, enum: designTypes, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String, required: true },
    stylePreference: { type: String, required: true },
    deadline: { type: Date, required: true },
    budget: { type: Number, required: false },
    references: { type: [String], default: [] },
    status: {
      type: String,
      enum: briefStatuses,
      default: "submitted",
    },
  },
  { timestamps: true }
);

export type BriefDoc = InferSchemaType<typeof briefSchema>;
export type DesignType = (typeof designTypes)[number];
export type BriefStatus = (typeof briefStatuses)[number];
export const BriefModel = model<BriefDoc>("Brief", briefSchema);
