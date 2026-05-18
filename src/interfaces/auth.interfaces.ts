import type { ReactNode } from "react";
import type { AuthUser, RegisterInput, RegistrationRole } from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface RegistrationRoleOption {
  value: RegistrationRole;
  label: string;
  icon: string;
  description: string;
}
