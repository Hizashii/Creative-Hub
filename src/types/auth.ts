import type { UserRole } from "./roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type RegistrationRole = "client" | "designer";

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  role: RegistrationRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
