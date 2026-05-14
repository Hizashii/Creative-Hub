import { useLocation } from "react-router-dom";

/** Prefix for current workspace (/client | /designer | /admin) */
export function useRoleAreaPrefix() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/designer")) return "/designer";
  if (pathname.startsWith("/admin")) return "/admin";
  return "/client";
}
