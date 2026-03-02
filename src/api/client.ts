const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || "Request failed");
  }
  return data as T;
}

export const auth = {
  register: (email: string, password: string, name: string) =>
    api<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, name }) }
    ),
  login: (email: string, password: string) =>
    api<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () => api<{ id: string; email: string; name: string; role: string }>("/auth/me"),
};

export const projects = {
  list: () => api<Array<{ _id: string; title: string; description: string }>>("/projects"),
  get: (id: string) =>
    api<{ _id: string; title: string; description: string }>(`/projects/${id}`),
  create: (title: string, description: string) =>
    api<{ _id: string; title: string; description: string }>("/projects", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    }),
  delete: (id: string) => api<void>(`/projects/${id}`, { method: "DELETE" }),
};
