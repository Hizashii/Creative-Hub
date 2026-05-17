import type { FormEvent } from "react";
import type { AuthUser } from "../context/auth-context";
import type { UserRole } from "../types/roles";
import type { FeedbackMessage, ProjectMember } from "../types/domain";

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
