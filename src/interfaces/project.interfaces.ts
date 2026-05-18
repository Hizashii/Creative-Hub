import type { FormEvent } from "react";
import type { AuthUser } from "../types/auth";
import type { UserRole } from "../types/roles";
import type { FeedbackMessage, Project, ProjectMember } from "../types/domain";

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
