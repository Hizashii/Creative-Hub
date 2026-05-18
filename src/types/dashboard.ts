export type FeedItem = {
  kind: "feedback" | "asset" | "task" | "brief";
  id: string;
  at: string;
  title: string;
  detail?: string;
  projectId?: string;
  projectTitle?: string;
  authorName?: string;
  companyName?: string;
  status?: string;
  url?: string;
};

export type DashboardTask = {
  id: string;
  projectId: string;
  projectTitle: string;
  columnId: string;
  columnTitle: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  labels: string[];
  updatedAt?: string;
};

export type CalendarDeadline = {
  id: string;
  title: string;
  companyName: string;
  deadline: string;
  status: string;
  projectId?: string;
  projectTitle?: string;
};

export type CalendarResponse = {
  deadlines?: CalendarDeadline[];
  briefs?: CalendarDeadline[];
};

export type DocumentRow = {
  id: string;
  projectId: string;
  projectTitle: string;
  filename: string;
  url: string;
  tags: string[];
  createdAt?: string;
};

export type LeadRow = {
  id: string;
  title: string;
  companyName: string;
  designType: string;
  deadline: string;
  status: string;
  createdAt?: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
};

export type ClientDirectoryRow = {
  id: string;
  name: string;
  email: string;
  projectCount: number;
  pendingSubmissionCount?: number;
  latestSubmissionId?: string;
  latestSubmissionTitle?: string;
};

export type CollaboratorRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type DesignerDirectoryRow = {
  id: string;
  name: string;
  email: string;
  role: "designer";
};

export type InvoiceRow = {
  id: string;
  createdById: string;
  clientUserId?: string;
  projectId?: string;
  projectTitle?: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminDashboardCounts = {
  projects: number;
  briefs: number;
  users: number;
  inProgress: number;
};
