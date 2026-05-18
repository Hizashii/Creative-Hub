import type { ReactNode } from "react";
import type { Tone } from "../types/ui";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  helper?: ReactNode;
  tone?: Tone;
}

export interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export interface StatusPillProps {
  children: ReactNode;
  tone?: Tone;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export interface IconButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}
