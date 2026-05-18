export type CalendarEvent =
  | { source: "task"; id: string; title: string; at: string; projectId: string; projectTitle: string }
  | { source: "brief"; id: string; title: string; at: string; companyName: string; status: string };
