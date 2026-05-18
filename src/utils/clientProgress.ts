import type { Brief, Project } from "../types/domain";
import type { ClientProgressStep, ClientProgressStepState } from "../types/clientWorkspace";

function state(isComplete: boolean, isCurrent: boolean): ClientProgressStepState {
  if (isComplete) return "complete";
  if (isCurrent) return "current";
  return "upcoming";
}

export function buildProjectProgressSteps(
  project: Project,
  hasDesignerAssets: boolean,
  changesRequested: boolean,
): ClientProgressStep[] {
  const pickedUp = ["in_progress", "pending", "completed"].includes(project.status);
  const pending = project.status === "pending";
  const completed = project.status === "completed";
  const reviewState: ClientProgressStepState = changesRequested
    ? "attention"
    : state(completed, pending);

  return [
    {
      id: "picked-up",
      label: "Picked up",
      description: "A designer is working on your request.",
      state: state(pending || completed || hasDesignerAssets, pickedUp && !hasDesignerAssets),
    },
    {
      id: "assets",
      label: "Assets sent",
      description: "Design files and previews from the designer appear here.",
      state: state(pending || completed, hasDesignerAssets && !pending && !completed),
    },
    {
      id: "approval",
      label: "Review",
      description: changesRequested
        ? "Changes were requested. The designer can revise and resend."
        : "Review the latest preview and approve when it is ready.",
      state: reviewState,
    },
    {
      id: "completed",
      label: "Completed",
      description: "The work is approved and the project is closed.",
      state: state(false, completed),
    },
  ];
}

export function buildBriefProgressSteps(brief: Brief): ClientProgressStep[] {
  const pickedUp = ["accepted", "in-progress", "pending", "completed"].includes(brief.status);
  const pending = brief.status === "pending";
  const completed = brief.status === "completed";

  return [
    {
      id: "submitted",
      label: "Submitted",
      description: "Your request is in the queue.",
      state: state(pickedUp, brief.status === "submitted"),
    },
    {
      id: "picked-up",
      label: "Picked up",
      description: "A designer will open a workspace for chat and assets.",
      state: state(pending || completed, pickedUp && !pending && !completed),
    },
    {
      id: "review",
      label: "Review",
      description: "You will review the designer's preview here.",
      state: state(completed, pending),
    },
    {
      id: "completed",
      label: "Completed",
      description: "The work is approved and the project is closed.",
      state: state(false, completed),
    },
  ];
}
