import { createContext } from "react";
import type { AuthContextValue } from "../interfaces/auth.interfaces";

export const AuthContext = createContext<AuthContextValue | null>(null);
