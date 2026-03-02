import { useState } from "react";

type Project = { id: string; title: string; description: string };

const MOCK_PROJECTS: Project[] = [
  { id: "1", title: "Brand Refresh", description: "New visual identity and logo concepts for 2025." },
  { id: "2", title: "Campaign Assets", description: "Social media graphics and ad creatives for Q1 launch." },
  { id: "3", title: "Website Redesign", description: "Landing page mockups and component library." },
];

export function Projects() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setProjects((p) => [
      ...p,
      { id: crypto.randomUUID(), title, description },
    ]);
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    setProjects((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <h1>Projects</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New project"}
        </button>
      </header>

      {showForm && (
        <form className="project-form" onSubmit={handleCreate}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
      )}

      <div className="project-grid">
        {projects.length === 0 ? (
          <p className="empty">No projects yet. Create one to get started.</p>
        ) : (
          projects.map((p) => (
            <article key={p.id} className="project-card">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
