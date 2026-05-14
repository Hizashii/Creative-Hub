import { Schema, model, type InferSchemaType } from "mongoose";

const feedbackSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export type FeedbackDoc = InferSchemaType<typeof feedbackSchema>;
export const FeedbackModel = model<FeedbackDoc>("Feedback", feedbackSchema);
