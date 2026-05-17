import type { Project } from "../../types/domain";
import { api } from "../../api/client";

export function ProjectStatusSelect({
  projectId,
  value,
  onUpdated,
}: {
  projectId: string;
  value: Project["status"];
  onUpdated: (p: Project) => void;
}) {
  return (
    <select
      className="select"
      style={{ maxWidth: 200 }}
      value={value}
      onChange={async (e) => {
        const status = e.target.value as Project["status"];
        const updated = await api<Project>(`/projects/${projectId}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        onUpdated(updated);
      }}
    >
      <option value="draft">Draft</option>
      <option value="in_progress">In progress</option>
      <option value="pending">Pending</option>
      <option value="paused">Paused</option>
      <option value="completed">Completed</option>
    </select>
  );
}
