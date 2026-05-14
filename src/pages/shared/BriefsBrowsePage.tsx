import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Brief } from "../../types/domain";
import { BriefCard } from "../../components/briefs/BriefCard";

export function BriefsBrowsePage() {
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [items, setItems] = useState<Brief[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api<Brief[]>("/briefs");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Requirements</h1>
          <p className="text-sm text-on-surface-variant mt-1">Guided submissions from clients and review history for the team.</p>
        </div>
        {area === "client" && (
          <Link
            to={`${base}/briefs/new`}
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm no-underline flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New requirement
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-sm text-on-surface-variant">No requirements yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((b) => (
            <BriefCard key={b.id} brief={b} to={`${base}/briefs/${b.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
