import { z } from "zod";

export const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1),
  role: z.enum(["client", "designer"]).optional().default("client"),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createBriefBody = z.object({
  title: z.string().min(1),
  companyName: z.string().min(1),
  designType: z.enum(["logo", "poster", "branding", "social-media", "website"]),
  description: z.string().min(1),
  targetAudience: z.string().min(1),
  stylePreference: z.string().min(1),
  deadline: z.coerce.date(),
  budget: z.number().optional(),
  references: z.array(z.string()).optional(),
});

export const updateBriefBody = createBriefBody.partial();

export const acceptBriefBody = z.object({
  designerUserId: z.string().optional(),
});

export const patchUserRoleBody = z.object({
  role: z.enum(["client", "designer", "admin"]),
});

export const createFeedbackBody = z.object({
  message: z.string().min(1),
});

export const createProjectBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "in_progress", "pending", "paused", "completed"]).optional(),
});

export const patchProjectBody = createProjectBody.partial().extend({
  price: z.number().nonnegative().optional(),
});

export const createColumnBody = z.object({
  title: z.string().min(1),
  order: z.number().optional(),
});

export const patchColumnBody = z.object({
  title: z.string().optional(),
  order: z.number().optional(),
});

export const createTaskBody = z.object({
  columnId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  order: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export const patchTaskBody = createTaskBody.partial();

export const addMemberBody = z.object({
  userId: z.string(),
  memberRole: z.enum(["lead", "member", "viewer"]).optional(),
});

export const createAssetBody = z.object({
  url: z.string().url(),
  filename: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const createInvoiceBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().min(1).optional(),
  status: z.enum(["draft", "sent", "paid", "void"]).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string().optional().nullable(),
  clientUserId: z.string().optional().nullable(),
});

export const patchInvoiceBody = createInvoiceBody.partial();
