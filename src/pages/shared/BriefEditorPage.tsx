import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Brief, DesignType } from "../../types/domain";

const designTypes: { value: DesignType; label: string }[] = [
  { value: "logo", label: "Logo" },
  { value: "poster", label: "Poster" },
  { value: "branding", label: "Branding" },
  { value: "social-media", label: "Social media" },
  { value: "website", label: "Website" },
];

export function BriefEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [fields, setFields] = useState({
    title: "",
    companyName: "",
    designType: "logo" as DesignType,
    description: "",
    targetAudience: "",
    stylePreference: "",
    deadline: "",
    budget: "",
    references: "",
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const b = await api<Brief>(`/briefs/${id}`);
        if (!cancelled && b) {
          setBrief(b);
          setFields({
            title: b.title,
            companyName: b.companyName,
            designType: b.designType,
            description: b.description,
            targetAudience: b.targetAudience,
            stylePreference: b.stylePreference,
            deadline: b.deadline.slice(0, 16),
            budget: b.budget != null ? String(b.budget) : "",
            references: b.references.join("\n"),
          });
        }
      } catch {
        if (!cancelled) setBrief(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    try {
      const refs = fields.references
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      await api(`/briefs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: fields.title,
          companyName: fields.companyName,
          designType: fields.designType,
          description: fields.description,
          targetAudience: fields.targetAudience,
          stylePreference: fields.stylePreference,
          deadline: new Date(fields.deadline).toISOString(),
          budget: fields.budget ? Number(fields.budget) : undefined,
          references: refs,
        }),
      });
      navigate(`${base}/briefs/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed");
    }
  }

  if (!brief) return <div className="page">Loading…</div>;

  return (
    <form className="page card" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <h1 className="page-title">Edit requirement</h1>
      <p>
        <Link to={`${base}/briefs/${id}`}>← Back</Link>
      </p>
      {error && <div className="alert">{error}</div>}
      <div className="field">
        <label>Title</label>
        <input className="input" value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} required />
      </div>
      <div className="field">
        <label>Company</label>
        <input
          className="input"
          value={fields.companyName}
          onChange={(e) => setFields({ ...fields, companyName: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Type</label>
        <select
          className="select"
          value={fields.designType}
          onChange={(e) => setFields({ ...fields, designType: e.target.value as DesignType })}
        >
          {designTypes.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Brief</label>
        <textarea
          className="textarea"
          value={fields.description}
          onChange={(e) => setFields({ ...fields, description: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Audience</label>
        <input
          className="input"
          value={fields.targetAudience}
          onChange={(e) => setFields({ ...fields, targetAudience: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Style</label>
        <textarea
          className="textarea"
          value={fields.stylePreference}
          onChange={(e) => setFields({ ...fields, stylePreference: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Deadline</label>
        <input
          className="input"
          type="datetime-local"
          value={fields.deadline}
          onChange={(e) => setFields({ ...fields, deadline: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Budget</label>
        <input className="input" type="number" value={fields.budget} onChange={(e) => setFields({ ...fields, budget: e.target.value })} />
      </div>
      <div className="field">
        <label>References (lines)</label>
        <textarea className="textarea" value={fields.references} onChange={(e) => setFields({ ...fields, references: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
