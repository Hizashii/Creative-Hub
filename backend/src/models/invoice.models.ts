import { Schema, model, type InferSchemaType } from "mongoose";

const invoiceStatuses = ["draft", "sent", "paid", "void"] as const;

const invoiceSchema = new Schema(
  {
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientUserId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: false, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: invoiceStatuses, default: "draft" },
    dueDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export type InvoiceDoc = InferSchemaType<typeof invoiceSchema>;
export const InvoiceModel = model<InvoiceDoc>("Invoice", invoiceSchema);
