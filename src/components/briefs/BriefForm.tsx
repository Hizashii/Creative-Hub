import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { DesignType } from "../../types/domain";

const designTypes: { value: DesignType; label: string }[] = [
  { value: "logo", label: "Logo" },
  { value: "poster", label: "Poster" },
  { value: "branding", label: "Branding" },
  { value: "social-media", label: "Social media" },
  { value: "website", label: "Website" },
];

export function BriefForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designType, setDesignType] = useState<DesignType>("logo");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [references, setReferences] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const refs = references
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      await api("/briefs", {
        method: "POST",
        body: JSON.stringify({
          title,
          companyName,
          designType,
          description,
          targetAudience,
          stylePreference,
          deadline: new Date(deadline).toISOString(),
          budget: budget ? Number(budget) : undefined,
          references: refs.length ? refs : undefined,
        }),
      });
      navigate("/client/briefs", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not submit requirement");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card page" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <div className="page-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1 className="page-title">New requirement</h1>
          <p>Describe your creative needs and references. Your creative team will review and follow up in the hub.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="field">
        <label htmlFor="title">Project title</label>
        <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="company">Company or brand name</label>
        <input id="company" className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="dtype">Design type</label>
        <select id="dtype" className="select" value={designType} onChange={(e) => setDesignType(e.target.value as DesignType)}>
          {designTypes.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="desc">Creative brief</label>
        <textarea id="desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="audience">Target audience</label>
        <input id="audience" className="input" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="style">Style preferences</label>
        <textarea id="style" className="textarea" value={stylePreference} onChange={(e) => setStylePreference(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="deadline">Desired deadline</label>
        <input id="deadline" className="input" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="budget">Budget (optional)</label>
        <input id="budget" className="input" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="refs">Reference links (one per line, optional)</label>
        <textarea id="refs" className="textarea" value={references} onChange={(e) => setReferences(e.target.value)} placeholder="https://…" />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit requirement"}
        </button>
      </div>
    </form>
  );
}
