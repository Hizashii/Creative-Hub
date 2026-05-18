import type { UserRole } from "./roles";

export type ProjectStatus = "draft" | "in_progress" | "pending" | "paused" | "completed";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  briefId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Column = {
  id: string;
  title: string;
  order: number;
  createdAt?: string;
};

export type Task = {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  assigneeId?: string;
  dueDate?: string;
  order: number;
  labels: string[];
  createdAt?: string;
};

export type ProjectMemberUser = {
  name: string;
  email: string;
  role: UserRole;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  memberRole: string;
  createdAt?: string;
  user?: ProjectMemberUser;
};

export type Asset = {
  id: string;
  projectId: string;
  uploaderId: string;
  url: string;
  filename: string;
  tags: string[];
  createdAt?: string;
};

export type FeedbackMessage = {
  id: string;
  projectId: string;
  authorId: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BriefStatus = "submitted" | "accepted" | "in-progress" | "pending" | "completed";

export type DesignType = "logo" | "poster" | "branding" | "social-media" | "website";

export type Brief = {
  id: string;
  clientId: string;
  title: string;
  companyName: string;
  designType: DesignType;
  description: string;
  targetAudience: string;
  stylePreference: string;
  deadline: string;
  budget?: number;
  references: string[];
  status: BriefStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AcceptBriefResponse = {
  project: {
    id: string;
  };
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
