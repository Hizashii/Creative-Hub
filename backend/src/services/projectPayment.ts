import { Types } from "mongoose";
import { FeedbackModel } from "../models/feedback.models";
import { InvoiceModel } from "../models/invoice.models";

const fallbackInvoiceAmount = 0;
export const paidUpMessage = "It's all paid up!";

export async function recordProjectPayment(
  project: { _id: unknown; ownerId: unknown; price?: number | null },
  actorId = new Types.ObjectId(String(project.ownerId)),
) {
  const amount = project.price ?? fallbackInvoiceAmount;
  await InvoiceModel.findOneAndUpdate(
    { projectId: project._id, title: "Final approval payment" },
    {
      $set: {
        createdById: actorId,
        clientUserId: project.ownerId,
        projectId: project._id,
        title: "Final approval payment",
        description: `${paidUpMessage} Payment received and project files are unlocked.`,
        amount,
        currency: "USD",
        status: "paid",
        dueDate: new Date(),
      },
    },
    { new: true, upsert: true },
  );

  const existingMessage = await FeedbackModel.exists({ projectId: project._id, message: paidUpMessage });
  if (!existingMessage) {
    await FeedbackModel.create({
      projectId: project._id,
      authorId: actorId,
      message: paidUpMessage,
    });
  }
}

export async function ensurePaidInvoicesForProjects(projects: Array<{ _id: unknown; ownerId: unknown }>) {
  await Promise.all(projects.map((project) => recordProjectPayment(project)));
}
