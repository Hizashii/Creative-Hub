import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth as authApi } from "../api/client";

type User = { id: string; email: string; name: string; role: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const register = async (email: string, password: string, name: string) => {
    const { token, user: u } = await authApi.register(email, password, name);
    localStorage.setItem("token", token);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
