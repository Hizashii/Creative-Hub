import type { Brief, BriefStatus, DesignType } from "../types/domain";

export interface BriefCardProps {
  brief: Brief;
  to: string;
}

export interface BriefStatusBadgeProps {
  status: BriefStatus;
}

export interface BriefStatusBadgeConfig {
  label: string;
  cls: string;
}

export interface DesignTypeOption {
  value: DesignType;
  label: string;
  icon: string;
  description?: string;
}

export interface BriefFilterOption {
  id: "all" | BriefStatus;
  label: string;
}

export interface ProjectLinkCopy {
  title: string;
  body: string;
}
