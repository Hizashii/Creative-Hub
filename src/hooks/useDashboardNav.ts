import { useLocation } from "react-router-dom";

export function useDashboardNav() {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1] || "client";
  const base = `/${segment}`;
  return { area: segment, base };
}
