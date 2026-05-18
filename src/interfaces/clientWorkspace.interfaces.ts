import type { FormEvent } from "react";
import type { AuthUser } from "../types/auth";
import type { ClientProgressStep } from "../types/clientWorkspace";
import type { Asset, Brief, FeedbackMessage, Project, ProjectMember } from "../types/domain";

export interface ClientProgressPipelineProps {
  steps: ClientProgressStep[];
}

export interface ClientAssetsPanelProps {
  assets: Asset[];
  project: Project;
  canApprovePreview: boolean;
  canRequestChanges: boolean;
  approvalPending: boolean;
  declinePending: boolean;
  canDownload: boolean;
  changesRequested: boolean;
  onApprovePreview: () => void;
  onRequestChanges: () => Promise<void>;
  onDeclinePrice: () => Promise<void>;
}

export interface ClientProjectWorkspaceViewProps {
  project: Project;
  base: string;
  assets: Asset[];
  members: ProjectMember[];
  feedback: FeedbackMessage[];
  currentUser: AuthUser | null;
  message: string;
  error: string | null;
  canApprovePreview: boolean;
  canRequestChanges: boolean;
  approvalPending: boolean;
  declinePending: boolean;
  changesRequested: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onApprovePreview: () => Promise<void>;
  onRequestChanges: () => Promise<void>;
  onDeclinePrice: () => Promise<void>;
}

export interface ClientBriefProgressViewProps {
  brief: Brief;
  base: string;
  created: boolean;
}
