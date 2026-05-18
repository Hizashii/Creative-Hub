import type { FormEvent } from "react";
import type { AuthUser } from "../types/auth";
import type { UserRole } from "../types/roles";
import type { Asset, Column, FeedbackMessage, Project, ProjectMember, Task } from "../types/domain";

export interface ProjectCardProps {
  project: Project;
  to: string;
}

export interface ProjectStatusDisplayConfig {
  label: string;
  cls: string;
}

export interface ProjectStatusSelectProps {
  projectId: string;
  value: Project["status"];
  onUpdated: (project: Project) => void;
}

export interface ProjectChatPanelProps {
  feedback: FeedbackMessage[];
  members: ProjectMember[];
  currentUser: AuthUser | null;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
}

export interface ChatMessageAuthor {
  isMine: boolean;
  name: string;
  initials: string;
  role?: UserRole;
}

export interface DesignerProjectWorkspaceViewProps {
  project: Project;
  base: string;
  columns: Column[];
  tasks: Task[];
  assets: Asset[];
  members: ProjectMember[];
  feedback: FeedbackMessage[];
  currentUser: AuthUser | null;
  message: string;
  error: string | null;
  fileUrl: string;
  fileName: string;
  newTaskTitle: string;
  newTaskCol: string;
  requestPending: boolean;
  pickUpPending: boolean;
  onFileUrlChange: (value: string) => void;
  onFileNameChange: (value: string) => void;
  onUploadFile: (event: FormEvent<HTMLFormElement>) => void;
  onTaskTitleChange: (value: string) => void;
  onTaskColChange: (value: string) => void;
  onAddTask: (event: FormEvent<HTMLFormElement>) => void;
  onMessageChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onRequestReview: () => void;
  onPickUp: () => void;
}
