import type { AppUserRole } from "../types/roles";

/** Accepts mongoose doc or lean user; ignores password when present */
export function userToJSON(
  user: { _id: unknown; email: string; name: string; role: AppUserRole } | null | undefined
) {
  if (!user) return null;
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
