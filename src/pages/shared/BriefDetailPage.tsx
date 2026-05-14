import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Brief, AdminUser } from "../../types/domain";
import { BriefStatusBadge } from "../../components/briefs/BriefStatusBadge";
import { useAuth } from "../../hooks/useAuth";

export function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const { user } = useAuth();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [designers, setDesigners] = useState<AdminUser[]>([]);
  const [designerId, setDesignerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const b = await api<Brief>(`/briefs/${id}`);
        if (!cancelled) setBrief(b);
      } catch {
        if (!cancelled) setBrief(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let cancelled = false;
    async function loadDesigners() {
      try {
        const users = await api<AdminUser[]>("/admin/users");
        if (!cancelled) setDesigners(users.filter((u) => u.role === "designer"));
      } catch {
        if (!cancelled) setDesigners([]);
      }
    }
    void loadDesigners();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  async function accept() {
    if (!id) return;
    setError(null);
    setAccepting(true);
    try {
      const res = await api<{ project: { id: string } }>(`/briefs/${id}/accept`, {
        method: "POST",
        body: JSON.stringify({ designerUserId: designerId || undefined }),
      });
      navigate(`${base}/projects/${res.project.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not accept brief");
    } finally {
      setAccepting(false);
    }
  }

  if (!brief) {
    return (
      <div className="page">
        <p>Loading or not found.</p>
        <Link to={`${base}/briefs`}>Back</Link>
      </div>
    );
  }

  const canEditClient = user?.role === "client" && brief.clientId === user.id && brief.status === "submitted";

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <p>
        <Link to={`${base}/briefs`}>← Requirements</Link>
      </p>
      <div className="page-header">
        <div>
          <h1 className="page-title">{brief.title}</h1>
          <p>
            {brief.companyName} · {brief.designType.replace("-", " ")}
          </p>
        </div>
        <BriefStatusBadge status={brief.status} />
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Brief</h2>
        <p>{brief.description}</p>
        <p>
          <strong>Audience:</strong> {brief.targetAudience}
        </p>
        <p>
          <strong>Style:</strong> {brief.stylePreference}
        </p>
        <p>
          <strong>Deadline:</strong> {new Date(brief.deadline).toLocaleString()}
        </p>
        {brief.budget != null && (
          <p>
            <strong>Budget:</strong> {brief.budget}
          </p>
        )}
        {brief.references?.length > 0 && (
          <div>
            <strong>References</strong>
            <ul>
              {brief.references.map((r) => (
                <li key={r}>
                  <a href={r} target="_blank" rel="noreferrer">
                    {r}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {canEditClient && (
        <Link to={`${base}/briefs/${brief.id}/edit`} className="btn btn-primary">
          Edit submission
        </Link>
      )}

      {user?.role === "admin" && brief.status === "submitted" && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Accept and create project</h2>
          {error && <div className="alert">{error}</div>}
          <div className="field">
            <label htmlFor="designer">Assign designer (optional)</label>
            <select id="designer" className="select" value={designerId} onChange={(e) => setDesignerId(e.target.value)}>
              <option value="">—</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.email})
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-primary" disabled={accepting} onClick={() => void accept()}>
            {accepting ? "Working…" : "Accept brief"}
          </button>
        </div>
      )}
    </div>
  );
}
